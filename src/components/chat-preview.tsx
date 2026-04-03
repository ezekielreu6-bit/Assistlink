"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ChatPreview({ 
  primaryColor, accentColor, companyName, messages = [], onSendMessage, isTyping 
}: any) {
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isTyping])

  const handleSend = () => {
    if (!inputValue.trim()) return
    onSendMessage(inputValue)
    setInputValue('')
  }

  return (
    <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-2xl border-none overflow-hidden">
      <div className="p-4 text-white flex items-center gap-2" style={{ backgroundColor: primaryColor }}>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="font-semibold text-sm">{companyName}</span>
      </div>

      <div ref={scrollRef} className="flex-1 p-4 bg-white overflow-y-auto space-y-4">
        {messages.map((msg: any, i: number) => (
          <div key={i} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
            <div 
              className={cn("p-3 text-sm max-w-[85%] rounded-2xl", 
                msg.role === 'user' ? "rounded-tr-none text-white" : "rounded-tl-none bg-gray-100 text-gray-800"
              )}
              style={msg.role === 'user' ? { backgroundColor: accentColor } : {}}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </div>

      <div className="p-3 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="bg-white"
          />
          <Button onClick={handleSend} style={{ backgroundColor: primaryColor }} size="icon">
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </Card>
  )
}