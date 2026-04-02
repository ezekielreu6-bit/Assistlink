"use client"

import React, { useState, useEffect } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { agentSmartReplySuggestions } from '@/ai/flows/agent-smart-reply-suggestions-flow'
import { useToast } from '@/hooks/use-toast'

interface SmartRepliesProps {
  customerMessage: string
  conversationHistory: { role: 'user' | 'agent'; message: string }[]
  onSelectReply: (reply: string) => void
}

export function SmartReplies({ customerMessage, conversationHistory, onSelectReply }: SmartRepliesProps) {
  const [replies, setReplies] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchReplies = async () => {
    if (!customerMessage) return
    setLoading(true)
    try {
      const result = await agentSmartReplySuggestions({
        customerMessage,
        conversationHistory
      })
      setReplies(result.suggestions)
    } catch (error) {
      console.error("Failed to fetch smart replies:", error)
      toast({
        title: "AI error",
        description: "Failed to generate reply suggestions.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReplies()
  }, [customerMessage])

  return (
    <div className="flex flex-col gap-2 p-3 bg-secondary/30 rounded-lg border border-primary/10">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Sparkles className="w-3 h-3" />
          <span>AI Suggestions</span>
        </div>
        {loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {replies.length > 0 ? (
          replies.map((reply, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="text-xs h-auto py-1.5 px-3 bg-white hover:bg-primary/5 hover:border-primary/30 transition-all rounded-full"
              onClick={() => onSelectReply(reply)}
            >
              {reply}
            </Button>
          ))
        ) : !loading && (
          <span className="text-[10px] text-muted-foreground italic px-1">
            No suggestions yet...
          </span>
        )}
      </div>
    </div>
  )
}
