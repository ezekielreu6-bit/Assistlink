"use client"

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { ChatPreview } from '@/components/chat-preview'
import { db } from '@/firebase'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'

function WidgetContent() {
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)

  const orgId = searchParams.get('id') || 'default'
  const primaryColor = `#${searchParams.get('primary') || '3333CC'}`
  const accentColor = `#${searchParams.get('accent') || '1FBAF5'}`

  
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    let sId = localStorage.getItem(`al_session_${orgId}`)
    if (!sId) {
      sId = Math.random().toString(36).substring(7)
      localStorage.setItem(`al_session_${orgId}`, sId)
    }
    setSessionId(sId)
  }, [orgId])


  useEffect(() => {
    if (!sessionId || !orgId) return

    const q = query(
      collection(db, 'organizations', orgId, 'chats', sessionId, 'messages'),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        role: doc.data().role,
        content: doc.data().content
      }))
      setMessages(msgs.length > 0 ? msgs : [{ role: 'assistant', content: "Hi! How can we help you today?" }])
    })

    return () => unsubscribe()
  }, [sessionId, orgId])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !sessionId) return
    
    setLoading(true)
    try {
    
      await addDoc(collection(db, 'organizations', orgId, 'chats', sessionId, 'messages'), {
        role: 'user',
        content,
        createdAt: serverTimestamp()
      })

     
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          message: content, 
          orgId, 
          sessionId 
        })
      })
      
    
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-screen bg-transparent">
      <ChatPreview 
        primaryColor={primaryColor} 
        accentColor={accentColor}
        companyName="Support"
        messages={messages} 
        onSendMessage={handleSendMessage}
        isTyping={loading}
      />
    </div>
  )
}

export default function WidgetUIPage() {
  return (
    <Suspense fallback={null}>
      <WidgetContent />
    </Suspense>
  )
}