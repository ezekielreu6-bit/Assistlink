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
  const rawPrimary = searchParams?.get('primary') || '3333CC'
  const rawAccent = searchParams?.get('accent') || '1FBAF5'
  
  
  const primaryColor = rawPrimary.startsWith('#') ? rawPrimary : `#${rawPrimary}`
  const accentColor = rawAccent.startsWith('#') ? rawAccent : `#${rawAccent}`

  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  
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

    try {
      const q = query(
        collection(db, 'organizations', orgId, 'chats', sessionId, 'messages'),
        orderBy('createdAt', 'asc')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          role: doc.data().role as string,
          content: doc.data().content as string
        }))
        
        if (msgs.length > 0) {
          setMessages(msgs)
        } else {
          setMessages([{ role: 'assistant', content: "Hi! How can we help you today?" }])
        }
      }, (error) => {
        console.error("Firestore subscription error:", error)
      })

      return () => unsubscribe()
    } catch (err) {
      console.error("Failed to setup Firestore listener:", err)
    }
  }, [isMounted, sessionId, orgId])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !sessionId || !db) return

    setLoading(true)
    try {
      
      await addDoc(collection(db, 'organizations', orgId, 'chats', sessionId, 'messages'), {
        role: 'user',
        content,
        createdAt: serverTimestamp()
      })

      
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

 
  if (!isMounted) {
    return null
  }

  return (
    <div className="w-full h-screen bg-transparent flex items-end justify-end">
      <ChatPreview 
        primaryColor={primaryColor} 
        accentColor={accentColor}
        companyName="Support"
        welcomeMessage="Hi! How can we help you today?"
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