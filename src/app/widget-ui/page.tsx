"use client"

import { useSearchParams } from 'next/navigation'
import { ChatPreview } from '@/components/chat-preview'
import { Suspense } from 'react'


function WidgetContent() {
  const searchParams = useSearchParams()
  
  const orgId = searchParams.get('id')
  const primaryColor = `#${searchParams.get('primary') || '3333CC'}`
  const accentColor = `#${searchParams.get('accent') || '1FBAF5'}`

  return (
    <div className="w-full h-screen bg-transparent flex items-end justify-end">
      <ChatPreview 
        primaryColor={primaryColor} 
        accentColor={accentColor}
        companyName="AssistLink Support"
        welcomeMessage="Hi! How can we help you today?"
      />
    </div>
  )
}


export default function WidgetUIPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-transparent" />}>
      <WidgetContent />
    </Suspense>
  )
}