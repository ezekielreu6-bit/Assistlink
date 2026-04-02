"use client"

import React, { useState } from 'react'
import { Send, Minus, X, MessageSquare, Paperclip } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChatPreviewProps {
  primaryColor: string
  accentColor: string
  companyName: string
  welcomeMessage: string
}

export function ChatPreview({ 
  primaryColor = '#3333CC', 
  accentColor = '#1FBAF5',
  companyName = 'AssistLink',
  welcomeMessage = 'Hi! How can we help you today?'
}: ChatPreviewProps) {
  const [isOpen, setIsOpen] = useState(true)

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
    <Card className="w-80 sm:w-96 overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
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

      {/* Messages */}
      <div className="flex-1 min-h-[300px] max-h-[400px] p-4 bg-background overflow-y-auto space-y-4">
        <div className="flex flex-col gap-1">
          <div className="bg-muted rounded-2xl rounded-tl-none p-3 text-sm max-w-[85%] text-foreground">
            {welcomeMessage}
          </div>
          <span className="text-[10px] text-muted-foreground ml-1">Just now</span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div 
            className="rounded-2xl rounded-tr-none p-3 text-sm max-w-[85%] text-white"
            style={{ backgroundColor: accentColor }}
          >
            I'm looking for the documentation on API integrations.
          </div>
          <span className="text-[10px] text-muted-foreground mr-1">1m ago</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="bg-muted rounded-2xl rounded-tl-none p-3 text-sm max-w-[85%] text-foreground">
            I can help with that! You can find our documentation at docs.assistlink.com.
          </div>
          <span className="text-[10px] text-muted-foreground ml-1">Sent</span>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="relative flex items-center">
          <Input 
            placeholder="Type your message..." 
            className="pr-20 py-6 rounded-xl border-muted bg-muted/30 focus-visible:ring-primary"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              className="h-8 w-8 rounded-lg shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-muted-foreground font-medium">
            Powered by <span className="text-primary font-bold">AssistLink</span>
          </span>
        </div>
      </div>
    </Card>
  )
}
