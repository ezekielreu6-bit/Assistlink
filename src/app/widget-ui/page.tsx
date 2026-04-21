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

  const [settings, setSettings] = useState({
    companyName: 'Support',
    showBranding: true,
    welcomeMessage: 'Hi! How can we help you today?',
  })

  const orgId = searchParams?.get('id') || 'default'
  const domain = searchParams?.get('domain') || 
    (typeof window !== 'undefined' ? window.location.hostname.replace(/[^a-zA-Z0-9]/g, '_') : 'default')

  const primaryColor = `#${searchParams?.get('primary') || '3333CC'}`
  const accentColor = `#${searchParams?.get('accent') || '1FBAF5'}`

  useEffect(() => { setIsMounted(true) }, [])

  // Fetch Organization Settings
  useEffect(() => {
    if (!isMounted || !orgId || !db) return

    async function fetchWidgetSettings() {
      try {
        const configRef = doc(db, 'organizations', orgId, 'chatWidgetConfigurations', 'default')
        const configSnap = await getDoc(configRef)

        if (configSnap.exists()) {
          const data = configSnap.data()
          setSettings({
            companyName: data.companyName || 'Support',
            showBranding: data.plan !== 'pro',
            welcomeMessage: data.welcomeMessage || 'Hi! How can we help you today?',
          })
        }
      } catch (err) {
        console.error("Error loading widget settings:", err)
      }
    }

    fetchWidgetSettings()
  }, [isMounted, orgId])

  // Create unique session per visitor + per website
  useEffect(() => {
    if (!isMounted || !orgId) return

    const sessionKey = `al_session_\( {orgId}_ \){domain}`
    let currentSessionId = localStorage.getItem(sessionKey)

    if (!currentSessionId) {
      currentSessionId = `sess_\( {Date.now().toString(36)}_ \){Math.random().toString(36).substring(2)}`
      localStorage.setItem(sessionKey, currentSessionId)
    }

    setSessionId(currentSessionId)
  }, [isMounted, orgId, domain])

  // Real-time listener for THIS visitor's session only
  useEffect(() => {
    if (!isMounted || !sessionId || !orgId || !db) return

    const colRef = collection(db, 'organizations', orgId, 'chatSessions', sessionId, 'chatMessages')
    const q = query(colRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        role: doc.data().role,
        content: doc.data().content
      }))

      setMessages(msgs.length > 0 ? msgs : [{ role: 'assistant', content: settings.welcomeMessage }])
    }, (err) => console.error("Firestore Listen Error:", err))

    return () => unsubscribe()
  }, [isMounted, sessionId, orgId, settings.welcomeMessage])

  // Handle sending message (with optional customer info from lead form)
  const handleSendMessage = async (content: string, customerInfo?: { name: string; email: string }) => {
    if (!content.trim() || !sessionId || !db) return

    setLoading(true)

    try {
      const colRef = collection(db, 'organizations', orgId, 'chatSessions', sessionId, 'chatMessages')

      await addDoc(colRef, {
        role: 'user',
        content: content.trim(),
        createdAt: serverTimestamp(),
        customerName: customerInfo?.name || null,
        customerEmail: customerInfo?.email || null,
      })

      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content.trim(), 
          orgId, 
          sessionId,
          customerName: customerInfo?.name,
          customerEmail: customerInfo?.email
        })
      })
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isMounted || !sessionId) {
    return <div className="w-full h-screen bg-transparent" />
  }

  return (
    <div className="w-full h-screen bg-transparent flex items-end justify-end p-6 md:p-8">
      <ChatPreview 
        primaryColor={primaryColor} 
        accentColor={accentColor}
        companyName={settings.companyName}
        welcomeMessage={settings.welcomeMessage}
        showBranding={settings.showBranding}
        messages={messages} 
        onSendMessage={handleSendMessage}
        isTyping={loading}
        sessionId={sessionId}
      />
    </div>
  )
}

export default function WidgetUIPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-transparent" />}>
      <WidgetContent />
    </Suspense>
  )
}