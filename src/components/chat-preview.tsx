"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, User, Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatPreviewProps {
  primaryColor?: string
  accentColor?: string
  companyName?: string
  welcomeMessage?: string
  messages?: Message[]
  onSendMessage?: (message: string, customerInfo?: { name: string; email: string }) => void
  isTyping?: boolean
  showBranding?: boolean
}

export function ChatPreview({
  primaryColor = '#3333CC',
  accentColor = '#1FBAF5',
  companyName = 'Support',
  welcomeMessage = 'Hi! How can we help you today?',
  messages = [],
  onSendMessage,
  isTyping = false,
  showBranding = true,
}: ChatPreviewProps) {
  const [inputValue, setInputValue] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [showLeadForm, setShowLeadForm] = useState(true) // Show on first interaction
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, isTyping])

  const handleSend = () => {
    if (!inputValue.trim() || !onSendMessage) return

    // If it's the first message, require name + email
    if (showLeadForm && (!customerName.trim() || !customerEmail.trim())) {
      alert("Please enter your name and email to continue.")
      return
    }

    const customerInfo = showLeadForm ? {
      name: customerName.trim(),
      email: customerEmail.trim()
    } : undefined

    onSendMessage(inputValue.trim(), customerInfo)
    setInputValue('')

    // Hide form after first message is sent
    if (showLeadForm) {
      setShowLeadForm(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="w-[360px] sm:w-[380px] h-[480px] overflow-hidden flex flex-col shadow-2xl border-0 rounded-3xl bg-white">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between text-white shrink-0" style={{ backgroundColor: primaryColor }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-2xl flex items-center justify-center text-xl">💬</div>
          <div>
            <p className="font-semibold text-base">{companyName}</p>
            <p className="text-xs text-white/75">Support</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Online
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 p-4 bg-zinc-50 overflow-y-auto space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-2xl bg-white shadow flex items-center justify-center text-xl flex-shrink-0">💬</div>
            <div className="bg-white rounded-3xl rounded-tl-none px-4 py-3 text-[15px] text-gray-800 max-w-[82%] shadow-sm">
              {welcomeMessage}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[82%] px-4 py-3 rounded-3xl text-[15px] leading-relaxed shadow-sm",
              msg.role === 'user' ? "rounded-tr-none text-white" : "rounded-tl-none bg-white text-gray-800"
            )}
              style={msg.role === 'user' ? { backgroundColor: accentColor } : {}}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-2xl bg-white shadow flex items-center justify-center text-xl">💬</div>
            <div className="bg-white rounded-3xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lead Capture Form - Shown before first message */}
      {showLeadForm && messages.length === 0 && (
        <div className="p-4 border-t bg-white space-y-3">
          <p className="text-sm text-center text-muted-foreground font-medium">Please tell us who you are</p>
          
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Your full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t shrink-0">
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={showLeadForm ? "Type your first message..." : "Type your message..."}
            className="pr-14 py-6 text-base rounded-2xl border-gray-200 bg-zinc-50 focus-visible:ring-2 focus-visible:ring-primary"
            disabled={isTyping}
          />

          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping || (showLeadForm && (!customerName.trim() || !customerEmail.trim()))}
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl transition-all active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Send className="w-5 h-5 text-white" />}
          </Button>
        </div>

        {showBranding && (
          <div className="mt-3 text-center">
            <p className="text-[10px] text-gray-400">
              Powered by <span className="font-medium" style={{ color: primaryColor }}>AssistLink</span>
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}