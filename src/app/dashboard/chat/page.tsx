"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SmartReplies } from '@/components/smart-replies'
import { 
  Search, 
  Send, 
  MoreHorizontal, 
  Phone, 
  Video, 
  User, 
  Clock, 
  Paperclip,
  Smile,
  CheckCircle,
  Archive,
  Loader2,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFirestore, useUser, useCollection, useDoc, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, doc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { formatDistanceToNow } from 'date-fns'

export default function ChatPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  const sessionsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(
      collection(db, 'organizations', 'default-org', 'chatSessions'),
      orderBy('updatedAt', 'desc')
    )
  }, [db])

  const { data: sessions, isLoading: sessionsLoading } = useCollection(sessionsQuery)

  const messagesQuery = useMemoFirebase(() => {
    if (!db || !selectedSessionId) return null
    return query(
      collection(db, 'organizations', 'default-org', 'chatSessions', selectedSessionId, 'chatMessages'),
      orderBy('timestamp', 'asc')
    )
  }, [db, selectedSessionId])

  const { data: messages } = useCollection(messagesQuery)

  const sessionRef = useMemoFirebase(() => 
    (db && selectedSessionId) ? doc(db, 'organizations', 'default-org', 'chatSessions', selectedSessionId) : null,
    [db, selectedSessionId]
  )
  const { data: activeSession } = useDoc(sessionRef)

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedSessionId || !user || !db) return
    
    const content = inputValue
    setInputValue('')

    const messageData = {
      chatSessionId: selectedSessionId,
      // Use email as senderId for consistency with profile IDs
      senderId: user.email || user.uid,
      senderType: 'agent',
      content,
      timestamp: serverTimestamp(),
      organizationId: 'default-org'
    }

    addDoc(collection(db, 'organizations', 'default-org', 'chatSessions', selectedSessionId, 'chatMessages'), messageData)

    updateDoc(doc(db, 'organizations', 'default-org', 'chatSessions', selectedSessionId), {
      updatedAt: serverTimestamp(),
      lastMessage: content
    })
  }

  const handleSelectReply = (reply: string) => {
    setInputValue(reply)
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col lg:flex-row gap-6 overflow-hidden animate-in slide-in-from-bottom-2 duration-500">
      <Card className={cn(
        "w-full lg:w-80 border-none shadow-sm flex flex-col rounded-2xl overflow-hidden shrink-0",
        selectedSessionId && "hidden lg:flex"
      )}>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-10 h-10 rounded-xl bg-muted/30 border-none"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {sessionsLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : sessions?.map((session) => (
            <button
              key={session.id}
              onClick={() => setSelectedSessionId(session.id)}
              className={cn(
                "w-full p-4 flex gap-4 hover:bg-muted/30 transition-all border-b border-border/50 text-left relative group",
                selectedSessionId === session.id && "bg-primary/5 border-l-4 border-l-primary"
              )}
            >
              <Avatar className="h-10 w-10 shrink-0 border border-border/50">
                <AvatarFallback>{session.customerName?.[0] || 'C'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={cn("text-sm font-semibold truncate", selectedSessionId === session.id ? "text-primary" : "text-foreground")}>
                    {session.customerName || 'Anonymous'}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {session.updatedAt ? formatDistanceToNow(session.updatedAt.toDate()) : 'Now'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 italic">
                  {session.lastMessage || 'Starting conversation...'}
                </p>
              </div>
            </button>
          ))}
        </ScrollArea>
      </Card>

      {selectedSessionId ? (
        <Card className="flex-1 border-none shadow-sm flex flex-col rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedSessionId(null)}>
                <User className="w-4 h-4" />
              </Button>
              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                <AvatarFallback>{activeSession?.customerName?.[0] || 'C'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm">{activeSession?.customerName || 'Anonymous'}</h2>
                  <Badge variant="secondary" className="text-[10px] h-4 uppercase tracking-tighter bg-green-100 text-green-700">Online</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Real-time session
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full">
                <Video className="w-4 h-4" />
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2 ml-2 rounded-xl h-9 px-4">
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Resolve</span>
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6 bg-muted/5">
            <div className="space-y-6">
              {messages?.map((msg, idx) => (
                <div 
                  key={msg.id || idx} 
                  className={cn(
                    "flex flex-col gap-1 max-w-[85%] sm:max-w-[70%]",
                    msg.senderType === 'agent' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div 
                    className={cn(
                      "p-4 rounded-3xl text-sm leading-relaxed shadow-sm",
                      msg.senderType === 'agent' 
                        ? "bg-primary text-white rounded-tr-none shadow-primary/10" 
                        : "bg-white text-foreground rounded-tl-none border border-border/50"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium px-2">
                    {msg.senderType === 'agent' ? 'You' : (activeSession?.customerName || 'Customer')} • {msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate()) : 'Now'}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 sm:p-6 border-t bg-white space-y-4">
            <SmartReplies 
              customerMessage={activeSession?.lastMessage || ''}
              conversationHistory={messages?.map(m => ({ role: m.senderType === 'agent' ? 'agent' : 'user', message: m.content })) || []}
              onSelectReply={handleSelectReply}
            />

            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Input 
                  placeholder="Type your reply..." 
                  className="pr-20 py-7 rounded-2xl border-muted bg-muted/20 focus-visible:ring-primary/20"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <Button 
                size="icon" 
                className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                onClick={handleSendMessage}
              >
                <Send className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 border-none shadow-sm flex flex-col items-center justify-center text-center p-12 rounded-2xl">
          <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
            <MessageSquare className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">No conversation selected</h2>
          <p className="text-muted-foreground max-w-sm">
            Choose a customer from the left list to start providing real-time support and AI-powered replies.
          </p>
        </Card>
      )}
    </div>
  )
}