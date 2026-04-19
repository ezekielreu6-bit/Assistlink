"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  MessageSquare, 
  CheckCircle2 
} from 'lucide-react'
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
  getDoc 
} from 'firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

function ChatContent() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const querySessionId = searchParams.get('session')

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [orgId, setOrgId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<'agent' | 'admin' | null>(null)

  // Smart Org ID Detection (works for both owner and invited agents)
  useEffect(() => {
    async function getOrgContext() {
      if (!user?.email || !db) return

      try {
        const userEmail = user.email.toLowerCase().trim()
        const userDocRef = doc(db, 'users', userEmail)
        const userSnap = await getDoc(userDocRef)

        let currentOrgId: string
        let role: 'agent' | 'admin' = 'agent'

        if (userSnap.exists()) {
          const userData = userSnap.data()
          currentOrgId = userData.organizationId || userEmail.replace(/\./g, '_')
          role = userData.role || 'agent'
        } else {
          currentOrgId = userEmail.replace(/\./g, '_')
          role = 'admin'
        }

        setOrgId(currentOrgId)
        setCurrentUserRole(role)

        if (querySessionId) {
          setSelectedSessionId(querySessionId)
        }
      } catch (error) {
        console.error("Error fetching org context:", error)
      }
    }

    getOrgContext()
  }, [user, db, querySessionId])

  // Fetch all sessions for this organization
  const sessionsQuery = useMemoFirebase(() => {
    if (!db || !orgId) return null
    return query(
      collection(db, 'organizations', orgId, 'chatSessions'),
      orderBy('updatedAt', 'desc')
    )
  }, [db, orgId])

  const { data: sessions = [], isLoading: sessionsLoading } = useCollection(sessionsQuery) || { data: [], isLoading: true }

  // Fetch messages for selected session
  const messagesQuery = useMemoFirebase(() => {
    if (!db || !orgId || !selectedSessionId) return null
    return query(
      collection(db, 'organizations', orgId, 'chatSessions', selectedSessionId, 'chatMessages'),
      orderBy('timestamp', 'asc')
    )
  }, [db, orgId, selectedSessionId])

  const { data: messages = [] } = useCollection(messagesQuery) || { data: [] }

  const sessionRef = useMemoFirebase(() => 
    (db && orgId && selectedSessionId) 
      ? doc(db, 'organizations', orgId, 'chatSessions', selectedSessionId) 
      : null,
    [db, orgId, selectedSessionId]
  )
  const { data: activeSession } = useDoc(sessionRef)

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedSessionId || !user || !db || !orgId) return

    const content = inputValue.trim()
    setInputValue('')

    try {
      await addDoc(
        collection(db, 'organizations', orgId, 'chatSessions', selectedSessionId, 'chatMessages'), 
        {
          role: 'assistant',           // Agent is replying
          content,
          senderType: 'agent',
          senderEmail: user.email,
          timestamp: serverTimestamp(),
        }
      )

      // Update session last message
      await updateDoc(
        doc(db, 'organizations', orgId, 'chatSessions', selectedSessionId), 
        {
          lastMessage: content,
          updatedAt: serverTimestamp(),
          lastReplyBy: 'agent'
        }
      )
    } catch (error) {
      toast({ title: "Failed to send message", variant: "destructive" })
    }
  }

  const handleResolveSession = async () => {
    if (!selectedSessionId || !db || !orgId) return

    await updateDoc(
      doc(db, 'organizations', orgId, 'chatSessions', selectedSessionId), 
      {
        status: 'resolved',
        updatedAt: serverTimestamp()
      }
    )

    toast({
      title: "Session Resolved",
      description: "Conversation marked as resolved.",
    })
  }

  if (!orgId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
      {/* Session List Sidebar */}
      <Card className={cn(
        "w-full lg:w-80 border-none shadow-sm flex flex-col rounded-2xl overflow-hidden shrink-0",
        selectedSessionId && "hidden lg:flex"
      )}>
        <div className="p-4 border-b bg-white">
          <h2 className="font-semibold text-lg">Conversations</h2>
        </div>

        <ScrollArea className="flex-1">
          {sessionsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No active conversations yet
            </div>
          ) : (
            sessions.map((session: any) => (
              <button
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                className={cn(
                  "w-full p-4 flex gap-4 hover:bg-muted/50 transition-all border-b text-left",
                  selectedSessionId === session.id && "bg-primary/5 border-l-4 border-primary"
                )}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {session.customerName?.[0] || 'C'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate text-sm">
                      {session.customerName || 'Anonymous Customer'}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {session.updatedAt ? formatDistanceToNow(session.updatedAt.toDate()) : 'New'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {session.lastMessage || 'New conversation'}
                  </p>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      {selectedSessionId && activeSession ? (
        <Card className="flex-1 border-none shadow-sm flex flex-col rounded-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedSessionId(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback>{activeSession.customerName?.[0] || 'C'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{activeSession.customerName || 'Customer'}</h3>
                <p className="text-xs text-muted-foreground">Live Chat</p>
              </div>
            </div>

            <Button 
              onClick={handleResolveSession}
              variant="outline"
              size="sm"
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Resolve
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6 bg-zinc-50">
            <div className="space-y-6">
              {messages.map((msg: any, idx: number) => (
                <div
                  key={idx}
                  className={cn(
                    "flex",
                    msg.senderType === 'agent' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] px-4 py-3 rounded-3xl text-sm",
                      msg.senderType === 'agent'
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-white border rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Reply Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-3">
              <Input
                placeholder="Type your reply..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 rounded-2xl"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white border-none shadow-sm rounded-2xl">
          <MessageSquare className="w-16 h-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold mb-2">No conversation selected</h2>
          <p className="text-muted-foreground max-w-md">
            Select a conversation from the list to start replying to customers.
          </p>
        </Card>
      )}
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}