"use client"

import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react'
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
  collection,
  query,
  orderBy,
  doc,
  addDoc,
  serverTimestamp,
  updateDoc,
  getDoc,
  limit,
  where
} from 'firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  senderType: 'user' | 'agent' | 'system'
  createdAt?: any
}

function ChatContent() {
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
  const inputRef = useRef<HTMLInputElement>(null)

  const querySessionId = searchParams?.get('session') || null

  // Fetch organization ID
  useEffect(() => {
    async function getOrgContext() {
      if (!user?.email || !db) {
        if (!userLoading) setIsLoadingOrg(false)
        return
      }

      try {
        const userEmail = user.email.toLowerCase().trim()
        const userDocRef = doc(db, 'users', userEmail)
        const userSnap = await getDoc(userDocRef)

        let currentOrgId = userEmail.replace(/\./g, '_')

        if (userSnap.exists()) {
          const userData = userSnap.data()
          if (userData.organizationId) {
            currentOrgId = userData.organizationId
          }
        }

        setOrgId(currentOrgId)

        if (querySessionId) {
          setSelectedSessionId(querySessionId)
        }
      } catch (error) {
        console.error("Error fetching org context:", error)
        toast({
          title: "Error loading organization",
          description: "Please refresh the page",
          variant: "destructive"
        })
      } finally {
        setIsLoadingOrg(false)
      }
    }

    getOrgContext()
  }, [user, userLoading, db, querySessionId, toast])

  // Query for active sessions
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

  // Query for messages
  const messagesQuery = useMemoFirebase(() => {
    if (!db || !orgId || !selectedSessionId) return null
    return query(
      collection(db, 'organizations', orgId, 'chatSessions', selectedSessionId, 'chatMessages'),
      orderBy('createdAt', 'asc')
    )
  }, [db, orgId, selectedSessionId])

  const { data: rawMessages = [], isLoading: messagesLoading } = useCollection(messagesQuery) || {}

  // Normalize messages
  const messages: Message[] = (rawMessages || []).map((msg: any) => ({
    id: msg.id || Math.random().toString(36),
    role: msg.senderType === 'agent' ? 'assistant' : 'user',
    content: msg.content || '',
    senderType: msg.senderType || 'user',
    createdAt: msg.createdAt
  }))

  // Get active session details
  const sessionRef = useMemoFirebase(() => {
    if (!db || !orgId || !selectedSessionId) return null
    return doc(db, 'organizations', orgId, 'chatSessions', selectedSessionId)
  }, [db, orgId, selectedSessionId])

  const { data: activeSession } = useDoc(sessionRef) || {}

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Focus input when session changes
  useEffect(() => {
    if (selectedSessionId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [selectedSessionId])

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !selectedSessionId || !user?.email || !db || !orgId || isSending) return

    const content = inputValue.trim()
    setInputValue('')
    setIsSending(true)

    try {
      await addDoc(
        collection(db, 'organizations', orgId, 'chatSessions', selectedSessionId, 'chatMessages'),
        {
          content,
          senderType: 'agent',
          senderEmail: user.email,
          createdAt: serverTimestamp(),
        }
      )

      await updateDoc(
        doc(db, 'organizations', orgId, 'chatSessions', selectedSessionId),
        {
          lastMessage: content,
          updatedAt: serverTimestamp(),
          lastReplyBy: 'agent'
        }
      )
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      })
      setInputValue(content) 
    } finally {
      setIsSending(false)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [inputValue, selectedSessionId, user, db, orgId, isSending, toast])

  const handleResolveSession = useCallback(async () => {
    if (!selectedSessionId || !db || !orgId) return

    try {
      await updateDoc(
        doc(db, 'organizations', orgId, 'chatSessions', selectedSessionId),
        {
          status: 'resolved',
          updatedAt: serverTimestamp()
        }
      )

      toast({
        title: "Session Resolved",
        description: "The conversation has been marked as resolved"
      })

      setSelectedSessionId(null)
    } catch (error) {
      console.error("Error resolving session:", error)
      toast({
        title: "Failed to resolve session",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }, [selectedSessionId, db, orgId, toast])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '...'
    try {
      // Handles both Firestore Timestamp and JS Date
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (e) {
      return 'Recently'
    }
  }

  if (userLoading || isLoadingOrg) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chat dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access the chat dashboard</p>
          <Button onClick={() => window.location.href = '/login'}>Sign In</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-4 flex flex-col lg:flex-row gap-4 overflow-hidden bg-gray-50">
      {/* Sessions Sidebar */}
      <Card className={cn(
        "w-full lg:w-80 border shadow-sm flex flex-col rounded-xl overflow-hidden shrink-0 bg-white",
        selectedSessionId && "hidden lg:flex"
      )}>
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Active Conversations</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {sessions.length} active {sessions.length === 1 ? 'chat' : 'chats'}
          </p>
        </div>

        <ScrollArea className="flex-1">
          {sessionsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No active conversations</p>
            </div>
          ) : (
            <div className="divide-y">
              {sessions.map((session: any) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={cn(
                    "w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors text-left",
                    selectedSessionId === session.id && "bg-primary/5 border-l-4 border-primary"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {session.customerName?.[0]?.toUpperCase() || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-medium truncate">
                        {session.customerName || 'Anonymous'}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(session.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {session.lastMessage || 'New conversation'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      {selectedSessionId ? (
        <Card className="flex-1 border shadow-sm flex flex-col rounded-xl overflow-hidden bg-white">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedSessionId(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {activeSession?.customerName?.[0]?.toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{activeSession?.customerName || 'Customer'}</h3>
                {activeSession?.customerEmail && <p className="text-xs text-muted-foreground">{activeSession.customerEmail}</p>}
              </div>
            </div>
            <Button onClick={handleResolveSession} variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Resolve Chat
            </Button>
          </div>

          <ScrollArea className="flex-1 p-6 bg-gray-50">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isAgent = msg.senderType === 'agent'
                  return (
                    <div key={msg.id} className={cn("flex", isAgent ? "justify-end" : "justify-start")}>
                      <div className={cn("flex items-end gap-2 max-w-[75%]", isAgent && "flex-row-reverse")}>
                        <div className={cn("px-4 py-2 rounded-2xl text-sm break-words", isAgent ? "bg-primary text-white rounded-tr-none" : "bg-white border shadow-sm rounded-tl-none")}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Type your reply..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isSending}>
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white">
          <MessageSquare className="w-12 h-12 text-primary mb-4 opacity-20" />
          <h2 className="text-2xl font-semibold mb-2">No chat selected</h2>
          <p className="text-muted-foreground">Select a conversation to start chatting.</p>
        </Card>
      )}
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}