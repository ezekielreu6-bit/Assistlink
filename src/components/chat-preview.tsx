"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Paperclip } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatPreviewProps {
  primaryColor: string
  accentColor: string
  companyName: string
  welcomeMessage: string
  messages?: Message[]
  onSendMessage?: (message: string) => void
  isTyping?: boolean
  showBranding?: boolean // NEW: Pro Feature
}

export function ChatPreview({ 
  primaryColor = '#3333CC', 
  accentColor = '#1FBAF5',
  companyName = 'AssistLink',
  welcomeMessage = 'Hi! How can we help you today?',
  messages = [],
  onSendMessage,
  isTyping = false,
  showBranding = true // Default to true (Free Tier)
}: ChatPreviewProps) {
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change or typing starts
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

  return (
    <Card className="w-[350px] sm:w-[400px] h-[550px] overflow-hidden flex flex-col shadow-2xl border-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between text-white shrink-0"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-semibold text-sm">{companyName} Support</span>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 bg-white overflow-y-auto space-y-4 scroll-smooth"
      >
        {/* Welcome Message (Shows if no history) */}
        {messages.length === 0 && (
          <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 text-sm max-w-[85%] text-gray-800">
              {welcomeMessage}
            </div>
          </div>
        )}

        {/* Dynamic Messages */}
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
                "rounded-2xl p-3 text-sm max-w-[85%] shadow-sm",
                msg.role === 'user' 
                  ? "rounded-tr-none text-white" 
                  : "rounded-tl-none bg-gray-100 text-gray-800"
              )}
              style={msg.role === 'user' ? { backgroundColor: accentColor } : {}}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 animate-pulse">
            <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t shrink-0">
        <div className="relative flex items-center">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..." 
            className="pr-12 py-6 rounded-xl border-gray-200 bg-gray-50/50 focus-visible:ring-primary"
          />
          <div className="absolute right-2 flex items-center">
            <Button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              size="icon" 
              className="h-9 w-9 rounded-lg shadow-md transition-all active:scale-90"
              style={{ backgroundColor: primaryColor }}
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-white" />}
            </Button>
          </div>
        </div>

        {/* PRO FEATURE: Conditional Branding */}
        {showBranding && (
          <div className="mt-3 text-center">
            <a 
              href="https://assistlink-bit.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-gray-400 hover:text-primary transition-colors font-medium tracking-tight"
            >
              Powered by <span className="font-bold" style={{ color: primaryColor }}>AssistLink</span>
            </a>
          </div>
        )}
      </div>
    </Card>
  )
}