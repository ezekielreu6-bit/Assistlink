"use client"

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { ChatPreview } from '@/components/chat-preview'
import { db } from '@/firebase'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore'

function WidgetContent() {
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // Widget Customization State
  const [settings, setSettings] = useState({
    companyName: 'Support', // Default name as requested
    showBranding: true,
    welcomeMessage: 'Hi! How can we help you today?'
  })

  const orgId = searchParams?.get('id') || 'default'
  const primaryColor = `#${searchParams?.get('primary') || '3333CC'}`
  const accentColor = `#${searchParams?.get('accent') || '1FBAF5'}`

  useEffect(() => { setIsMounted(true) }, [])

  // 1. Fetch Organization Widget Settings (Pro Status & Custom Overrides)
  useEffect(() => {
    if (!isMounted || !orgId || !db) return

    async function fetchWidgetSettings() {
      try {
        const configRef = doc(db, 'organizations', orgId, 'chatWidgetConfigurations', 'default')
        const configSnap = await getDoc(configRef)
        
        if (configSnap.exists()) {
          const data = configSnap.data()
          setSettings({
            companyName: data.companyName || 'Support', // Use custom name if set, else "Support"
            showBranding: data.plan !== 'pro', // Hide branding only for Pro users
            welcomeMessage: data.welcomeMessage || 'Hi! How can we help you today?'
          })
        }
      } catch (err) {
        console.error("Error loading widget settings:", err)
      }
    }

    fetchWidgetSettings()
  }, [isMounted, orgId])

  // 2. Handle Session Persistence
  useEffect(() => {
    if (!isMounted) return
    let sId = localStorage.getItem(`al_session_${orgId}`)
    if (!sId) {
      sId = Math.random().toString(36).substring(7)
      localStorage.setItem(`al_session_${orgId}`, sId)
    }
    setSessionId(sId)
  }, [isMounted, orgId])

  // 3. Listen for Messages
  useEffect(() => {
    if (!isMounted || !sessionId || !orgId || !db) return

    const colRef = collection(db, 'organizations', orgId, 'chatSessions', sessionId, 'chatMessages')
    const q = query(colRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        role: doc.data().role,
        content: doc.data().content
      }))

      if (msgs.length > 0) {
        setMessages(msgs)
      } else {
        setMessages([{ role: 'assistant', content: settings.welcomeMessage }])
      }
    }, (err) => {
      console.error("Firestore Listen Error:", err.message)
    })

    return () => unsubscribe()
  }, [isMounted, sessionId, orgId, settings.welcomeMessage])

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
    <div className="w-full h-screen bg-transparent flex items-end justify-end p-4">
      <ChatPreview 
        primaryColor={primaryColor} 
        accentColor={accentColor}
        companyName={settings.companyName}
        welcomeMessage={settings.welcomeMessage}
        showBranding={settings.showBranding}
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