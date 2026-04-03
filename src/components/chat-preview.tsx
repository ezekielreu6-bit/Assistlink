"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Send, Minus, X, MessageSquare, Paperclip, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id?: string
}

interface ChatPreviewProps {
  primaryColor: string
  accentColor: string
  companyName: string
  welcomeMessage: string
  messages?: Message[]
  onSendMessage?: (message: string) => void
  isTyping?: boolean
}

export function ChatPreview({ 
  primaryColor = '#3333CC', 
  accentColor = '#1FBAF5',
  companyName = 'AssistLink',
  welcomeMessage = 'Hi! How can we help you today?',
  messages = [],
  onSendMessage,
  isTyping = false
}: ChatPreviewProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

 
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = () => {
    if (!inputValue.trim() || !onSendMessage) return
    onSendMessage(inputValue)
    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95 z-50"
        style={{ backgroundColor: primaryColor, color: 'white' }}
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    )
  }

  return (
    <Card className="w-80 sm:w-[400px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-300 border-none">
    
      <div 
        className="p-4 flex items-center justify-between text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-semibold text-sm">{companyName} Support</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

    
      <div 
        ref={scrollRef}
        className="flex-1 h-[400px] p-4 bg-background overflow-y-auto space-y-4 scroll-smooth"
      >
        
        {messages.length === 0 && (
          <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="bg-muted rounded-2xl rounded-tl-none p-3 text-sm max-w-[85%] text-foreground">
              {welcomeMessage}
            </div>
          </div>
        )}

       
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={cn(
              "flex flex-col gap-1 animate-in fade-in duration-300",
              msg.role === 'user' ? "items-end" : "items-start"
            )}
          >
            <div 
              className={cn(
                "rounded-2xl p-3 text-sm max-w-[85%]",
                msg.role === 'user' 
                  ? "rounded-tr-none text-white" 
                  : "rounded-tl-none bg-muted text-foreground"
              )}
              style={msg.role === 'user' ? { backgroundColor: accentColor } : {}}
            >
              {msg.content}
            </div>
          </div>
        ))}

       
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
            <div className="bg-muted rounded-2xl rounded-tl-none p-3">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

    
      <div className="p-4 bg-white border-t">
        <div className="relative flex items-center">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..." 
            className="pr-20 py-6 rounded-xl border-muted bg-muted/30 focus-visible:ring-primary"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hidden sm:flex">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              size="icon" 
              className="h-8 w-8 rounded-lg shadow-sm transition-all active:scale-90"
              style={{ backgroundColor: primaryColor }}
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-muted-foreground font-medium">
            Powered by <span style={{ color: primaryColor }} className="font-bold">AssistLink</span>
          </span>
        </div>
      </div>
    </Card>
  )
}