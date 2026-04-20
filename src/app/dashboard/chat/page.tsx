"use client"

import React, { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  getDoc 
} from 'firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

// Separate component for the content that uses searchParams
function ChatPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: userLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [orgId, setOrgId] = useState<string | null>(null)
  const [isLoadingOrg, setIsLoadingOrg] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get session from URL safely
  const querySessionId = searchParams?.get('session') || null

  // Fetch correct orgId
  useEffect(() => {
    async function getOrgContext() {
      if (!user?.email || !db) {
        if (!userLoading && !user) {
          setIsLoadingOrg(false)
          setError("Please sign in to access the chat")
        }
        return
      }

      try {
        setError(null)
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
      } catch (err) {
        console.error("Error fetching org context:", err)
        setError("Failed to load organization data")
        toast({ 
          title: "Error loading organization", 
          description: "Please try refreshing the page",
          variant: "destructive" 
        })
      } finally {
        setIsLoadingOrg(false)
      }
    }

    getOrgContext()
  }, [user, userLoading, db, querySessionId, toast])

  // Sessions list - only run when orgId exists
  const sessionsQuery = useMemoFirebase(() => {
    if (!db || !orgId) return null
    try {
      return query(
        collection(db, 'organizations', orgId, 'chatSessions'),
        orderBy('updatedAt', 'desc')
      )
    } catch (err) {
      console.error("Error creating sessions query:", err)
      return null
    }
  }, [db, orgId])

  const sessionsResult = useCollection(sessionsQuery)
  const sessions = sessionsResult?.data || []
  const sessionsLoading = sessionsResult?.isLoading ?? true
  const sessionsError = sessionsResult?.error

  // Messages for selected session
  const messagesQuery = useMemoFirebase(() => {
    if (!db || !orgId || !selectedSessionId) return null
    try {
      return query(
        collection(db, 'organizations', orgId, 'chatSessions', selectedSessionId, 'chatMessages'),
        orderBy('createdAt', 'asc')
      )
    } catch (err) {
      console.error("Error creating messages query:", err)
      return null
    }
  }, [db, orgId, selectedSessionId])

  const messagesResult = useCollection(messagesQuery)
  const rawMessages = messagesResult?.data || []

  // Normalize messages safely
  const messages = rawMessages.map((msg: any) => ({
    id: msg?.id || Math.random().toString(36),
    role: msg?.role || (msg?.senderType === 'agent' ? 'assistant' : 'user'),
    content: msg?.content || '',
    senderType: msg?.senderType || (msg?.role === 'assistant' ? 'agent' : 'user'),
  }))

  const sessionRef = useMemoFirebase(() => {
    if (!db || !orgId || !selectedSessionId) return null
    try {
      return doc(db, 'organizations', orgId, 'chatSessions', selectedSessionId)
    } catch (err) {
      console.error("Error creating session ref:", err)
      return null
    }
  }, [db, orgId, selectedSessionId])
  
  const activeSessionResult = useDoc(sessionRef)
  const activeSession = activeSessionResult?.data

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedSessionId || !user || !db || !orgId) return

    const content = inputValue.trim()
    setInputValue('')

    try {
      await addDoc(collection(db, 'organizations', orgId, 'chatSessions', selectedSessionId, 'chatMessages'), {
        role: 'assistant',
        content,
        senderType: 'agent',
        senderEmail: user.email,
        createdAt: serverTimestamp(),
      })

      await updateDoc(doc(db, 'organizations', orgId, 'chatSessions', selectedSessionId), {
        lastMessage: content,
        updatedAt: serverTimestamp(),
        lastReplyBy: 'agent'
      })
    } catch (err) {
      console.error("Error sending message:", err)
      toast({ 
        title: "Failed to send message", 
        description: "Please try again",
        variant: "destructive" 
      })
      setInputValue(content) // Restore input on error
    }
  }

  const handleResolveSession = async () => {
    if (!selectedSessionId || !db || !orgId) return

    try {
      await updateDoc(doc(db, 'organizations', orgId, 'chatSessions', selectedSessionId), {
        status: 'resolved',
        updatedAt: serverTimestamp()
      })
      toast({ title: "Session Resolved" })
    } catch (err) {
      console.error("Error resolving session:", err)
      toast({ 
        title: "Failed to resolve session", 
        description: "Please try again",
        variant: "destructive" 
      })
    }
  }

  const handleBackToList = () => {
    setSelectedSessionId(null)
  }

  const formatSessionTime = (timestamp: any) => {
    if (!timestamp?.toDate) return 'New'
    try {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true })
    } catch (err) {
      return 'Recently'
    }
  }

  // Show loading state
  if (userLoading || isLoadingOrg) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">{error || "Please sign in to access the chat dashboard"}</p>
          <Button onClick={() => router.push('/login')}>Sign In</Button>
        </div>
      </div>
    )
  }

  // Show no database error
  if (!db) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-muted-foreground">Unable to connect to database. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  // Show no org error
  if (!orgId) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Organization Not Found</h2>
          <p className="text-muted-foreground mb-4">Unable to load your organization data. Please contact support.</p>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-4 flex flex-col lg:flex-row gap-4 overflow-hidden">
      {/* Sessions List Sidebar */}
      <Card className={cn(
        "w-full lg:w-80 border-none shadow-sm flex flex-col rounded-2xl overflow-hidden shrink-0",
        selectedSessionId && "hidden lg:flex"
      )}>
        <div className="p-4 border-b bg-white">
          <h2 className="font-semibold text-lg">Conversations</h2>
        </div>

        <ScrollArea className="flex-1">
          {sessionsError ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Failed to load conversations</p>
            </div>
          ) : sessionsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
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
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{session.customerName?.[0] || 'C'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium truncate">{session.customerName || 'Anonymous'}</p>
                      {session.customerEmail && (
                        <p className="text-xs text-muted-foreground truncate">{session.customerEmail}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatSessionTime(session.updatedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {session.lastMessage || 'New conversation'}
                  </p>
                  {session.status === 'active' && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      {selectedSessionId ? (
        <Card className="flex-1 border-none shadow-sm flex flex-col rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden" 
                onClick={handleBackToList}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback>{activeSession?.customerName?.[0] || 'C'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{activeSession?.customerName || 'Customer'}</h3>
                {activeSession?.customerEmail && (
                  <p className="text-xs text-muted-foreground">{activeSession.customerEmail}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Live Chat</span>
                  {activeSession?.status === 'active' && (
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            <Button 
              onClick={handleResolveSession} 
              variant="outline" 
              size="sm" 
              className="text-green-600 border-green-200 hover:bg-green-50"
              disabled={activeSession?.status === 'resolved'}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {activeSession?.status === 'resolved' ? 'Resolved' : 'Resolve'}
            </Button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6 bg-zinc-50">
            {messagesResult?.isLoading ? (
              <div className="flex items-center justify-center h-full py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Waiting for customer to start chatting...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg: any) => {
                  const isAgent = msg.senderType === 'agent' || msg.role === 'assistant'
                  return (
                    <div
                      key={msg.id}
                      className={cn("flex", isAgent ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] px-4 py-3 rounded-3xl text-sm shadow-sm",
                          isAgent 
                            ? "bg-primary text-white rounded-tr-none" 
                            : "bg-white border rounded-tl-none"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Reply Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-3">
              <Input
                placeholder="Type your reply..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="flex-1 rounded-2xl"
                disabled={activeSession?.status === 'resolved'}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || activeSession?.status === 'resolved'}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            {activeSession?.status === 'resolved' && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                This conversation has been resolved
              </p>
            )}
          </div>
        </Card>
      ) : (
        <Card className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white border-none shadow-sm rounded-2xl">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No conversation selected</h2>
          <p className="text-muted-foreground max-w-md">
            Select a conversation from the list to start replying to customers.
          </p>
        </Card>
      )}
    </div>
  )
}

// Main export with Suspense boundary
export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chat interface...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}