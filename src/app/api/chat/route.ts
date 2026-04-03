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
  updateDoc
} from 'firebase/firestore';
import { agentSmartReplySuggestions } from '@/ai/flows/agent-smart-reply-suggestions-flow'; 

export async function POST(req: Request) {
  try {
    const { message, orgId, sessionId } = await req.json();

    if (!message || !orgId || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch recent conversation history for context (last 6 messages)
    const messagesRef = collection(db, 'organizations', orgId, 'chatSessions', sessionId, 'chatMessages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(6));
    const querySnapshot = await getDocs(q);
    
    // Map Firestore data to the format your Genkit flow expects
    const history = querySnapshot.docs
      .map(doc => ({
        role: (doc.data().role === 'user' ? 'user' : 'agent') as 'user' | 'agent',
        message: doc.data().content as string
      }))
      .reverse(); // Reverse to get chronological order

    // 2. Run your Genkit Flow to get smart suggestions
    const { suggestions } = await agentSmartReplySuggestions({
      customerMessage: message,
      conversationHistory: history
    });

    // 3. Save the User's message to Firestore
    // We include the suggestions in the user's message document 
    // so the Agent Dashboard can render them immediately under the message.
    const userMessageRef = await addDoc(messagesRef, {
      role: 'user',
      content: message,
      createdAt: serverTimestamp(),
      aiSuggestions: suggestions // Store suggestions here for the agent to see
    });

    // 4. Update the session's "lastMessage" and "status"
    const sessionRef = doc(db, 'organizations', orgId, 'chatSessions', sessionId);
    await updateDoc(sessionRef, {
      lastMessage: message,
      lastMessageAt: serverTimestamp(),
      status: 'active' // Ensure session is marked as needing attention
    });

    return NextResponse.json({ 
      success: true, 
      messageId: userMessageRef.id,
      suggestions: suggestions 
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}