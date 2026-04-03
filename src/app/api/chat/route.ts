import { NextResponse } from 'next/server'
import { db } from '@/firebase' 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(req: Request) {
  try {
    const { message, orgId, sessionId } = await req.json()

   
    const aiResponse = "I received your message: " + message; 

    
    if (db) {
      await addDoc(collection(db, 'organizations', orgId, 'chatSessions', sessionId, 'chatMessages'), {
        role: 'assistant',
        content: aiResponse,
        createdAt: serverTimestamp()
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}