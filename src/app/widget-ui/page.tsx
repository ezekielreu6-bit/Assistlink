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
    companyName: 'Support',
    showBranding: true,
    welcomeMessage: 'Hi! How can we help you today?',
    // Add more premium options later (avatar, position, etc.)
  })

  const orgId = searchParams?.get('id') || 'default'
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
          setSettings(prev => ({
            ...prev,
            companyName: data.companyName || 'Support',
            showBranding: data.plan !== 'pro', // Only Pro hides branding
            welcomeMessage: data.welcomeMessage || 'Hi! How can we help you today?',
            // You can add more fields here (e.g. avatarUrl, position: 'bottom-right')
          }))
        }
      } catch (err) {
        console.error("Error loading widget settings:", err)
      }
    }

    fetchWidgetSettings()
  }, [isMounted, orgId])

  // Session Persistence (unchanged - good)
  useEffect(() => {
    if (!isMounted) return
    let sId = localStorage.getItem(`al_session_${orgId}`)
    if (!sId) {
      sId = `sess_\( {Date.now().toString(36)} \){Math.random().toString(36).substring(2)}`
      localStorage.setItem(`al_session_${orgId}`, sId)
    }
    setSessionId(sId)
  }, [isMounted, orgId])

  // Listen for Messages (improved welcome logic)
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

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !sessionId || !db) return

    setLoading(true)

    try {
      const colRef = collection(db, 'organizations', orgId, 'chatSessions', sessionId, 'chatMessages')
      await addDoc(colRef, {
        role: 'user',
        content: content.trim(),
        createdAt: serverTimestamp()
      })

      // Call your AI/backend endpoint
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content.trim(), 
          orgId, 
          sessionId 
        })
      })
    } catch (error) {
      console.error("Failed to send message:", error)
      // Optional: show error toast in ChatPreview
    } finally {
      setLoading(false)
    }
  }

  if (!isMounted) return null

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
        // Pass more props later: avatar, borderRadius, etc.
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