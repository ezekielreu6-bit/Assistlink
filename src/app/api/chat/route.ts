import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { agentSmartReplySuggestions } from '@/ai/flows/agent-smart-reply-suggestions-flow'; 
import { generateAutoReply } from '@/ai/flows/generate-auto-reply-flow'; // ← Create this flow (I'll help below)

export async function POST(req: Request) {
  try {
    const { message, orgId, sessionId } = await req.json();

    if (!message?.trim() || !orgId || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const trimmedMessage = message.trim();

    // 1. Fetch organization config to check plan + custom instructions
    const configRef = doc(db, 'organizations', orgId, 'chatWidgetConfigurations', 'default');
    const configSnap = await getDoc(configRef);
    const config = configSnap.exists() ? configSnap.data() : {};
    
    const isPro = config.plan === 'pro' || config.plan === 'premium'; // adjust if you use different labels

    // 2. Fetch rich conversation history (last 12 messages for better context)
    const messagesRef = collection(db, 'organizations', orgId, 'chatSessions', sessionId, 'chatMessages');
    const historyQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(12));
    const snapshot = await getDocs(historyQuery);

    const history = snapshot.docs
      .map((d) => ({
        role: d.data().role === 'user' ? 'user' : 'assistant',
        content: d.data().content as string,
      }))
      .reverse();

    // 3. Always get smart suggestions for the agent dashboard
    let suggestions: string[] = [];
    try {
      const result = await agentSmartReplySuggestions({
        customerMessage: trimmedMessage,
        conversationHistory: history,
        orgConfig: {
          companyName: config.companyName || 'Support',
          customInstructions: config.aiInstructions || '',
        },
      });
      suggestions = result.suggestions || [];
    } catch (err) {
      console.error("Suggestions flow failed:", err);
      suggestions = ["I'll look into this and get back to you soon."];
    }

    // 4. Pro-only: Generate and send AI auto-reply instantly
    let autoReplyContent: string | null = null;

    if (isPro) {
      try {
        const { reply } = await generateAutoReply({
          customerMessage: trimmedMessage,
          conversationHistory: history,
          orgConfig: {
            companyName: config.companyName || 'Support',
            welcomeMessage: config.welcomeMessage,
            customInstructions: config.aiInstructions || '',
            // Add any other fields you store (e.g. knowledge base reference)
          },
        });

        if (reply && reply.trim()) {
          autoReplyContent = reply.trim();

          // Save the AI reply to Firestore so widget sees it in real-time
          await addDoc(messagesRef, {
            role: 'assistant',
            content: autoReplyContent,
            createdAt: serverTimestamp(),
            isAutoReply: true,        // flag for dashboard/UI
            generatedBy: 'ai',
          });
        }
      } catch (autoReplyError) {
        console.error("Auto-reply generation failed:", autoReplyError);
        // Don't fail the whole request — still save user message
      }
    }

    // 5. Update session metadata
    const sessionRef = doc(db, 'organizations', orgId, 'chatSessions', sessionId);
    await updateDoc(sessionRef, {
      lastMessage: trimmedMessage,
      lastMessageAt: serverTimestamp(),
      lastMessageBy: 'user',
      status: 'active',
      hasAutoReply: !!autoReplyContent,   // useful for agent view
    });

    // 6. Return success
    return NextResponse.json({
      success: true,
      suggestions,
      autoReplySent: !!autoReplyContent,
      // You can return the reply for debugging, but widget gets it via Firestore listener
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}