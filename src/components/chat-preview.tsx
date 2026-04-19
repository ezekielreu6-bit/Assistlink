"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
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
  onSendMessage?: (message: string) => void
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
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom whenever messages or typing state changes
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
    onSendMessage(inputValue.trim())
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="w-[360px] sm:w-[400px] h-[560px] overflow-hidden flex flex-col shadow-2xl border-0 rounded-3xl bg-white">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between text-white shrink-0"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <span className="text-lg">💬</span>
          </div>
          <div>
            <p className="font-semibold text-base leading-none">{companyName}</p>
            <p className="text-xs text-white/80 mt-0.5">Support</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-white/90">Online</span>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 p-5 bg-zinc-50 overflow-y-auto space-y-6 scroll-smooth"
      >
        {/* Initial Welcome Message */}
        {messages.length === 0 && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-2xl bg-white shadow flex items-center justify-center flex-shrink-0">
              💬
            </div>
            <div className="bg-white rounded-3xl rounded-tl-none px-4 py-3 text-sm text-gray-800 max-w-[85%] shadow-sm">
              {welcomeMessage}
            </div>
          </div>
        )}

        {/* Render Messages */}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={cn(
              "flex",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] px-4 py-3 rounded-3xl text-sm leading-relaxed shadow-sm",
                msg.role === 'user'
                  ? "rounded-tr-none text-white"
                  : "rounded-tl-none bg-white text-gray-800"
              )}
              style={
                msg.role === 'user'
                  ? { backgroundColor: accentColor }
                  : {}
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-2xl bg-white shadow flex items-center justify-center flex-shrink-0">
              💬
            </div>
            <div className="bg-white rounded-3xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
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
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="pr-14 py-6 text-base rounded-2xl border-gray-200 bg-zinc-50 focus-visible:ring-2 focus-visible:ring-offset-2"
            disabled={isTyping}
          />

          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="absolute right-2 h-10 w-10 rounded-xl shadow transition-all active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </Button>
        </div>

        {/* Branding (Hidden for Pro users) */}
        {showBranding && (
          <div className="mt-4 text-center">
            <a
              href="https://assistlink-bit.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              Powered by <span className="font-semibold" style={{ color: primaryColor }}>AssistLink</span>
            </a>
          </div>
        )}
      </div>
    </Card>
  )
}