import { NextResponse } from 'next/server'
import { db } from '@/firebase' 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'


export async function POST(req: Request) {
  try {
    const { message, orgId, sessionId } = await req.json()

   
    // const aiResponse = await myAiFlow.run({ prompt: message, orgId });
    const aiResponse = "This is a response from AssistLink AI." 

  
    await addDoc(collection(db, 'organizations', orgId, 'chats', sessionId, 'messages'), {
      role: 'assistant',
      content: aiResponse,
      createdAt: serverTimestamp()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}