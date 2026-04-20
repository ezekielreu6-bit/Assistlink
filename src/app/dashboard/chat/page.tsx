"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Debug component to test each part
function ChatDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [error, setError] = useState<string | null>(null)
  
  // Test 1: Check if useSearchParams works
  try {
    const searchParams = useSearchParams()
    var sessionParam = searchParams?.get('session')
  } catch (err) {
    console.error("useSearchParams error:", err)
    return (
      <div className="p-8">
        <h1 className="text-red-600 text-xl">useSearchParams Error</h1>
        <p className="mt-2">Make sure this component is wrapped in Suspense boundary</p>
        <pre className="mt-4 p-4 bg-gray-100 rounded">{String(err)}</pre>
      </div>
    )
  }

  useEffect(() => {
    // Debug function to test each dependency
    async function runDiagnostics() {
      const results: any = {}
      
      // Test Firebase imports
      try {
        const { useFirestore, useUser } = await import('@/firebase')
        results.firebaseImports = "✅ Success"
      } catch (err) {
        results.firebaseImports = `❌ Failed: ${err}`
      }

      // Test UI component imports
      try {
        await import('@/components/ui/card')
        await import('@/components/ui/avatar')
        results.uiImports = "✅ Success"
      } catch (err) {
        results.uiImports = `❌ Failed: ${err}`
      }

      // Test date-fns
      try {
        await import('date-fns')
        results.dateFns = "✅ Success"
      } catch (err) {
        results.dateFns = `❌ Failed: ${err}`
      }

      setDebugInfo(results)
    }

    runDiagnostics()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Chat Component Diagnostics</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <h2 className="font-semibold mb-2">Router Status</h2>
          <p>Search Params working: ✅</p>
          <p>Session param: {sessionParam || 'none'}</p>
        </div>

        <div className="p-4 bg-gray-50 border rounded">
          <h2 className="font-semibold mb-2">Module Imports</h2>
          <pre className="text-sm">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h2 className="font-semibold mb-2">Next Steps</h2>
          <p>If all imports are successful, the issue may be with:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Firebase configuration</li>
            <li>Authentication state</li>
            <li>Firestore permissions</li>
            <li>Missing environment variables</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Simplified version that should definitely work
function MinimalChatPage() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Chat Dashboard</h1>
      <p className="text-muted-foreground">Component mounted successfully</p>
      
      {/* Uncomment to run diagnostics */}
      {/* <ChatDebug /> */}
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading chat...</p>
        </div>
      </div>
    }>
      <MinimalChatPage />
    </Suspense>
  )
}