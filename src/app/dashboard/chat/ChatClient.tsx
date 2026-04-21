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
  // --- SAFETY GATE ---
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => { setIsMounted(true) }, [])

  const { user, loading: userLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [orgId, setOrgId] = useState<string | null>(null)
  const [isLoadingOrg, setIsLoadingOrg] = useState(true)
  const [isSending, setIsSending] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sync session ID from URL
  useEffect(() => {
    if (isMounted) {
      const session = searchParams?.get('session')
      if (session) setSelectedSessionId(session)
    }
  }, [isMounted, searchParams])

  // Get Organization Context
  useEffect(() => {
    if (!isMounted || !user?.email || !db) {
      if (!userLoading) setIsLoadingOrg(false)
      return
    }

    async function fetchOrg() {
      try {
        const email = user?.email?.toLowerCase().trim()
        if (!email) return
        
        const userDocRef = doc(db!, 'users', email)
        const userSnap = await getDoc(userDocRef)

        let id = email.replace(/\./g, '_')
        if (userSnap.exists() && userSnap.data()?.organizationId) {
          id = userSnap.data().organizationId
        }
        setOrgId(id)
      } catch (e) {
        console.error("Org fetch error", e)
      } finally {
        setIsLoadingOrg(false)
      }
    }
    fetchOrg()
  }, [user, userLoading, db, isMounted])

  // Queries
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedSessionId || !orgId || !db || !user?.email) return
    const msg = inputValue.trim()
    setInputValue('')
    setIsSending(true)
    try {
      await addDoc(collection(db, 'organizations', orgId, 'chatSessions', selectedSessionId, 'chatMessages'), {
        content: msg, senderType: 'agent', senderEmail: user.email, createdAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'organizations', orgId, 'chatSessions', selectedSessionId), {
        lastMessage: msg, updatedAt: serverTimestamp(), lastReplyBy: 'agent'
      })
    } catch (e) {
      toast({ title: "Error", description: "Failed to send" })
      setInputValue(msg)
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [rawMessages])

  // IMPORTANT: Do not render anything until mounted to prevent Client Exception
  if (!isMounted || userLoading || isLoadingOrg) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Button onClick={() => window.location.href = '/login'}>Please Sign In</Button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-4 flex flex-col lg:flex-row gap-4 bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Card className={cn("w-full lg:w-80 border flex flex-col bg-white shrink-0", selectedSessionId && "hidden lg:flex")}>
        <div className="p-4 border-b font-bold">Conversations</div>
        <ScrollArea className="flex-1">
          {sessions.map((s: any) => (
            <button 
              key={s.id} 
              onClick={() => setSelectedSessionId(s.id)}
              className={cn("w-full p-4 border-b text-left hover:bg-gray-50", selectedSessionId === s.id && "bg-blue-50")}
            >
              <div className="font-semibold truncate">{s.customerName || 'Anonymous'}</div>
              <div className="text-xs text-gray-500 truncate">{s.lastMessage}</div>
            </button>
          ))}
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      {selectedSessionId ? (
        <Card className="flex-1 flex flex-col bg-white overflow-hidden border">
          <div className="p-4 border-b flex items-center justify-between">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedSessionId(null)}><ArrowLeft /></Button>
            <div className="font-bold">{activeSession?.customerName || 'Chat'}</div>
            <div />
          </div>
          
          <ScrollArea className="flex-1 p-4 bg-gray-50/50">
            {rawMessages.map((m: any) => (
              <div key={m.id} className={cn("mb-4 flex", m.senderType === 'agent' ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] p-3 rounded-xl text-sm", m.senderType === 'agent' ? "bg-primary text-white" : "bg-white border")}>
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
              placeholder="Message..."
            />
            <Button onClick={handleSendMessage} disabled={isSending}><Send className="h-4 w-4" /></Button>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 flex items-center justify-center text-gray-400">
          Select a chat to respond
        </Card>
      )}
    </div>
  )
}