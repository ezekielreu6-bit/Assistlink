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
import { generateAutoReply } from '@/ai/flows/generate-auto-reply-flow'; 
import { sendNewSupportNotification } from '@/lib/email-action'; 

export async function POST(req: Request) {
  try {
    const { 
      message, 
      orgId, 
      sessionId,
      customerName,     // From widget lead form
      customerEmail     // From widget lead form
    } = await req.json();

    if (!message?.trim() || !orgId || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const trimmedMessage = message.trim();

    // 1. Fetch organization config
    const configRef = doc(db, 'organizations', orgId, 'chatWidgetConfigurations', 'default');
    const configSnap = await getDoc(configRef);
    const config = configSnap.exists() ? configSnap.data() : {};

    const isPro = config.plan === 'pro' || config.plan === 'premium';

    // 2. Fetch conversation history
    const messagesRef = collection(db, 'organizations', orgId, 'chatSessions', sessionId, 'chatMessages');
    const historyQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(12));
    const snapshot = await getDocs(historyQuery);

    const history = snapshot.docs
      .map((d) => ({
        role: d.data().role === 'user' ? 'user' : 'assistant',
        content: d.data().content as string,
      }))
      .reverse();

    // 3. Get smart suggestions for the agent dashboard
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

    // 4. Pro-only AI Auto-reply
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
          },
        });

        if (reply && reply.trim()) {
          autoReplyContent = reply.trim();

          await addDoc(messagesRef, {
            role: 'assistant',
            content: autoReplyContent,
            createdAt: serverTimestamp(),
            isAutoReply: true,
            generatedBy: 'ai',
          });
        }
      } catch (autoReplyError) {
        console.error("Auto-reply generation failed:", autoReplyError);
      }
    }

    // 5. Save user message with customer info (if provided)
    await addDoc(messagesRef, {
      role: 'user',
      content: trimmedMessage,
      createdAt: serverTimestamp(),
      customerName: customerName || null,
      customerEmail: customerEmail || null,
    });

    // 6. Update session metadata + store customer info
    const sessionRef = doc(db, 'organizations', orgId, 'chatSessions', sessionId);
    await updateDoc(sessionRef, {
      lastMessage: trimmedMessage,
      lastMessageAt: serverTimestamp(),
      lastMessageBy: 'user',
      status: 'active',
      hasAutoReply: !!autoReplyContent,
      customerName: customerName || null,
      customerEmail: customerEmail || null,
    });

    // 7. Notify organization owner
    try {
      const orgRef = doc(db, 'organizations', orgId);
      const orgSnap = await getDoc(orgRef);

      if (orgSnap.exists()) {
        const ownerEmail = orgSnap.data().ownerEmail || orgSnap.data().email;

        if (ownerEmail) {
          await sendNewSupportNotification(
            ownerEmail,
            customerName || "Customer",
            trimmedMessage.length > 90 
              ? trimmedMessage.substring(0, 87) + "..." 
              : trimmedMessage,
            sessionId,
            orgId
          );
        }
      }
    } catch (notifyError) {
      console.error("Failed to send owner notification:", notifyError);
      // Don't break the chat if notification fails
    }

    return NextResponse.json({
      success: true,
      suggestions,
      autoReplySent: !!autoReplyContent,
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}