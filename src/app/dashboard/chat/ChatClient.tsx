"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, Send, Loader2, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFirestore, useUser, useCollection, useDoc, useMemoFirebase } from '@/firebase'
import {
  collection, query, orderBy, doc, addDoc, 
  serverTimestamp, updateDoc, getDoc, limit, where
} from 'firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

export default function ChatClient() {
  const { user, loading: userLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const [mounted, setMounted] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [orgId, setOrgId] = useState<string | null>(null)
  const [isLoadingOrg, setIsLoadingOrg] = useState(true)
  const [isSending, setIsSending] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 1. Prevent Hydration Errors (Dates/SearchParams)
  useEffect(() => {
    setMounted(true)
    const session = searchParams?.get('session')
    if (session) setSelectedSessionId(session)
  }, [searchParams])

  // 2. Fetch Organization ID
  useEffect(() => {
    if (!mounted || !user?.email || !db) {
      if (!userLoading) setIsLoadingOrg(false)
      return
    }

    async function getOrgContext() {
      try {
        const userEmail = user!.email!.toLowerCase().trim()
        const userDocRef = doc(db!, 'users', userEmail)
        const userSnap = await getDoc(userDocRef)

        let currentOrgId = userEmail.replace(/\./g, '_')
        if (userSnap.exists() && userSnap.data()?.organizationId) {
          currentOrgId = userSnap.data().organizationId
        }
        setOrgId(currentOrgId)
      } catch (error) {
        console.error("Org Context Error:", error)
      } finally {
        setIsLoadingOrg(false)
      }
    }
    getOrgContext()
  }, [user, userLoading, db, mounted])

  // 3. Firestore Queries
  const sessionsQuery = useMemoFirebase(() => {
    if (!db || !orgId) return null
    return query(
      collection(db, 'organizations', orgId, 'chatSessions'),
      where('status', '==', 'active'),
      orderBy('updatedAt', 'desc'),
      limit(50)
    )
  }, [db, orgId])

  const { data: sessions = [], isLoading: sessionsLoading } = useCollection(sessionsQuery) || {}

  const messagesQuery = useMemoFirebase(() => {
    if (!db || !orgId || !selectedSessionId) return null
    return query(
      collection(db, 'organizations', orgId, 'chatSessions', selectedSessionId, 'chatMessages'),
      orderBy('createdAt', 'asc')
    )
  }, [db, orgId, selectedSessionId])

  const { data: rawMessages = [] } = useCollection(messagesQuery) || {}

  const activeSessionRef = useMemoFirebase(() => {
    if (!db || !orgId || !selectedSessionId) return null
    return doc(db, 'organizations', orgId, 'chatSessions', selectedSessionId)
  }, [db, orgId, selectedSessionId])

  const { data: activeSession } = useDoc(activeSessionRef) || {}

  // 4. Formatting helper (Safe for Hydration)
  const formatTime = (timestamp: any) => {
    if (!mounted || !timestamp) return ''
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch { return 'Recently' }
  }

  // 5. Actions
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedSessionId || !orgId || !db || !user?.email) return
    const content = inputValue.trim()
    setInputValue('')
    setIsSending(true)
    try {
      await addDoc(collection(db, 'organizations', orgId, 'chatSessions', selectedSessionId, 'chatMessages'), {
        content, senderType: 'agent', senderEmail: user.email, createdAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'organizations', orgId, 'chatSessions', selectedSessionId), {
        lastMessage: content, updatedAt: serverTimestamp(), lastReplyBy: 'agent'
      })
    } catch (e) {
      toast({ title: "Error", description: "Failed to send", variant: "destructive" })
      setInputValue(content)
    } finally { setIsSending(false) }
  }

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [rawMessages])

  // LOADING STATES
  if (!mounted || userLoading || isLoadingOrg) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
  }

  if (!user) {
    return <div className="h-screen flex items-center justify-center"><Button onClick={() => window.location.href='/login'}>Sign In</Button></div>
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-4 flex flex-col lg:flex-row gap-4 bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Card className={cn("w-full lg:w-80 border flex flex-col bg-white shrink-0", selectedSessionId && "hidden lg:flex")}>
        <div className="p-4 border-b font-bold">Active Conversations</div>
        <ScrollArea className="flex-1">
          {sessions.length === 0 ? <div className="p-8 text-center text-gray-400">No active chats</div> : (
            sessions.map((s: any) => (
              <button 
                key={s.id} 
                onClick={() => setSelectedSessionId(s.id)}
                className={cn("w-full p-4 border-b text-left hover:bg-gray-50 transition-colors", selectedSessionId === s.id && "bg-primary/5 border-l-4 border-primary")}
              >
                <div className="font-semibold truncate">{s.customerName || 'Anonymous'}</div>
                <div className="text-xs text-gray-500">{formatTime(s.updatedAt)}</div>
                <div className="text-sm truncate text-gray-600 mt-1">{s.lastMessage}</div>
              </button>
            ))
          )}
        </ScrollArea>
      </Card>

      {/* Main Area */}
      {selectedSessionId ? (
        <Card className="flex-1 flex flex-col bg-white overflow-hidden border">
          <div className="p-4 border-b flex items-center justify-between">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedSessionId(null)}><ArrowLeft /></Button>
            <div className="font-bold">{activeSession?.customerName || 'Customer'}</div>
            <Button variant="outline" size="sm" className="text-green-600">Resolve</Button>
          </div>
          
          <ScrollArea className="flex-1 p-4 bg-gray-50/50">
            {rawMessages.map((m: any) => (
              <div key={m.id} className={cn("mb-4 flex", m.senderType === 'agent' ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] p-3 rounded-2xl text-sm", m.senderType === 'agent' ? "bg-primary text-white rounded-tr-none" : "bg-white border shadow-sm rounded-tl-none")}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="p-4 border-t flex gap-2">
            <Input 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isSending}
            />
            <Button onClick={handleSendMessage} disabled={isSending || !inputValue.trim()}>
              {isSending ? <Loader2 className="animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 flex flex-col items-center justify-center bg-white text-gray-400">
          <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
          <p>Select a chat to begin</p>
        </Card>
      )}
    </div>
  )
}