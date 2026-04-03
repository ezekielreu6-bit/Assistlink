"use client"

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { ChatPreview } from '@/components/chat-preview'
import { db } from '@/firebase'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'

function WidgetContent() {
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

 
  const orgId = searchParams?.get('id') || 'default'
  const primaryColor = `#${searchParams?.get('primary') || '3333CC'}`
  const accentColor = `#${searchParams?.get('accent') || '1FBAF5'}`

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    if (!isMounted) return
    let sId = localStorage.getItem(`al_session_${orgId}`)
    if (!sId) {
      sId = Math.random().toString(36).substring(7)
      localStorage.setItem(`al_session_${orgId}`, sId)
    }
    setSessionId(sId)
  }, [isMounted, orgId])

  useEffect(() => {
    if (!isMounted || !sessionId || !orgId || !db) return

  
    const colRef = collection(db, 'organizations', orgId, 'chatSessions', sessionId, 'chatMessages')
    
    
    const q = query(colRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        role: doc.data().role,
        content: doc.data().content
      }))
      
      console.log("Messages received from Firestore:", msgs.length)
      
      if (msgs.length > 0) {
        setMessages(msgs)
      } else {
        setMessages([{ role: 'assistant', content: "Hi! How can we help you today?" }])
      }
    }, (err) => {
      console.error("Firestore Listen Error:", err.message)
    })

    return () => unsubscribe()
  }, [isMounted, sessionId, orgId])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !sessionId || !db) return
    
    
    const userMsg = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true)

    try {
      
      const colRef = collection(db, 'organizations', orgId, 'chatSessions', sessionId, 'chatMessages')
      await addDoc(colRef, {
        role: 'user',
        content,
        createdAt: serverTimestamp() 
      })

      
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, orgId, sessionId })
      })
    } catch (error) {
      console.error("Failed to send:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isMounted) return null

  return (
    <div className="w-full h-screen bg-transparent flex items-end justify-end">
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