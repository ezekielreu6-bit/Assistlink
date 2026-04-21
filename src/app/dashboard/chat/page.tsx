
import { Suspense } from 'react'
import ChatClient from './ChatClient' 
import { Loader2 } from 'lucide-react'

export const metadata = {
  title: 'Chat Dashboard | AssistBit',
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chat interface...</p>
        </div>
      </div>
    }>
      <ChatClient />
    </Suspense>
  )
}