"use client"

import React, { useState } from 'react'
import { mockChats } from '@/lib/mock-data'
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
  Archive
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(mockChats[0])
  const [messages, setMessages] = useState(selectedChat.messages)
  const [inputValue, setInputValue] = useState('')

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    const newMsg = { role: 'agent', content: inputValue }
    setMessages([...messages, newMsg])
    setInputValue('')
  }

  const handleSelectReply = (reply: string) => {
    setInputValue(reply)
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-6 overflow-hidden animate-in slide-in-from-bottom-2 duration-500">
      {/* Sidebar List */}
      <Card className="w-80 border-none shadow-sm flex flex-col rounded-2xl overflow-hidden shrink-0">
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
          {mockChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat)
                setMessages(chat.messages)
              }}
              className={cn(
                "w-full p-4 flex gap-4 hover:bg-muted/30 transition-all border-b border-border/50 text-left relative group",
                selectedChat.id === chat.id && "bg-primary/5 border-l-4 border-l-primary"
              )}
            >
              <Avatar className="h-10 w-10 shrink-0 border border-border/50">
                <AvatarImage src={chat.avatar} />
                <AvatarFallback>{chat.customerName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={cn("text-sm font-semibold truncate", selectedChat.id === chat.id ? "text-primary" : "text-foreground")}>
                    {chat.customerName}
                  </p>
                  <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 italic">
                  {chat.lastMessage}
                </p>
              </div>
              {chat.status === 'active' && (
                <div className="absolute top-4 right-1.5 w-2 h-2 rounded-full bg-accent" />
              )}
            </button>
          ))}
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 border-none shadow-sm flex flex-col rounded-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarImage src={selectedChat.avatar} />
              <AvatarFallback>{selectedChat.customerName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm">{selectedChat.customerName}</h2>
                <Badge variant="secondary" className="text-[10px] h-4 uppercase tracking-tighter bg-green-100 text-green-700">Online</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Wait time: 1m 24s
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full">
              <Video className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2 ml-2 rounded-xl h-9 px-4">
              <CheckCircle className="w-4 h-4" />
              Resolve
            </Button>
          </div>
        </div>

        {/* Messages List */}
        <ScrollArea className="flex-1 p-6 bg-muted/5">
          <div className="space-y-6">
            <div className="flex justify-center">
              <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground border-border/50 px-4 py-0.5 rounded-full bg-white">
                Yesterday, Oct 24
              </Badge>
            </div>
            
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex flex-col gap-1 max-w-[80%]",
                  msg.role === 'agent' ? "ml-auto items-end" : "items-start"
                )}
              >
                <div 
                  className={cn(
                    "p-4 rounded-3xl text-sm leading-relaxed shadow-sm",
                    msg.role === 'agent' 
                      ? "bg-primary text-white rounded-tr-none shadow-primary/10" 
                      : "bg-white text-foreground rounded-tl-none border border-border/50"
                  )}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground font-medium px-2">
                  {msg.role === 'agent' ? 'Alex C. • 10:24 AM' : `${selectedChat.customerName} • 10:23 AM`}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* AI Smart Replies & Input */}
        <div className="p-6 border-t bg-white space-y-4">
          <SmartReplies 
            customerMessage={selectedChat.lastMessage}
            conversationHistory={messages}
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
                <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl">
                  <Smile className="w-5 h-5" />
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

      {/* Customer Info Card */}
      <Card className="w-80 border-none shadow-sm hidden xl:flex flex-col rounded-2xl overflow-hidden shrink-0">
        <div className="p-6 text-center border-b bg-gradient-to-b from-primary/5 to-transparent">
          <Avatar className="h-20 w-20 mx-auto border-4 border-white shadow-xl mb-4">
            <AvatarImage src={selectedChat.avatar} />
            <AvatarFallback>{selectedChat.customerName[0]}</AvatarFallback>
          </Avatar>
          <h3 className="font-bold text-lg">{selectedChat.customerName}</h3>
          <p className="text-xs text-muted-foreground">Premium Plan Subscriber</p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="outline" className="bg-white">B2B</Badge>
            <Badge variant="outline" className="bg-white">Priority</Badge>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <User className="w-3 h-3" />
                Contact Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">sarah.j@example.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">+1 (555) 123-4567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">New York, US</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Recent History
              </h4>
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs font-semibold mb-1">Billing Question</p>
                  <p className="text-[10px] text-muted-foreground">Oct 20 • Resolved by Marcus</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs font-semibold mb-1">Feature Request</p>
                  <p className="text-[10px] text-muted-foreground">Sep 12 • Resolved by Alex</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Button variant="outline" className="w-full justify-start text-xs rounded-xl h-10">
                <Archive className="w-4 h-4 mr-2" />
                Archive Customer
              </Button>
            </div>
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}
