"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

function DiagnosticPage() {
  const [testResults, setTestResults] = useState<any>({})
  const [currentTest, setCurrentTest] = useState('')
  const [allPassed, setAllPassed] = useState(false)
  const searchParams = useSearchParams()

  const runTest = async (name: string, testFn: () => Promise<boolean>) => {
    setCurrentTest(name)
    try {
      const passed = await testFn()
      setTestResults((prev: any) => ({ ...prev, [name]: passed }))
      return passed
    } catch (error) {
      console.error(`Test "${name}" failed:`, error)
      setTestResults((prev: any) => ({ ...prev, [name]: false, [`${name}_error`]: String(error) }))
      return false
    }
  }

  useEffect(() => {
    async function runAllTests() {
      const results: any = {}
      
      // Test 1: UI Components
      const test1 = await runTest('UI Components', async () => {
        try {
          await import('@/components/ui/avatar')
          await import('@/components/ui/input')
          await import('@/components/ui/scroll-area')
          return true
        } catch {
          return false
        }
      })
      if (!test1) return

      // Test 2: Lucide Icons
      const test2 = await runTest('Lucide Icons', async () => {
        try {
          await import('lucide-react')
          return true
        } catch {
          return false
        }
      })
      if (!test2) return

      // Test 3: Date-fns
      const test3 = await runTest('Date-fns', async () => {
        try {
          await import('date-fns')
          return true
        } catch {
          return false
        }
      })
      if (!test3) return

      // Test 4: Firebase Imports
      const test4 = await runTest('Firebase Module', async () => {
        try {
          const firebase = await import('@/firebase')
          return !!(firebase && firebase.useFirestore)
        } catch (error) {
          console.error('Firebase import error:', error)
          return false
        }
      })
      if (!test4) return

      // Test 5: Firebase Initialization
      const test5 = await runTest('Firebase Init', async () => {
        try {
          const { useFirestore, useUser } = await import('@/firebase')
          
          // Create a test component to check hooks
          const TestComponent = () => {
            try {
              const db = useFirestore()
              const user = useUser()
              return !!(db && user)
            } catch {
              return false
            }
          }
          return true
        } catch {
          return false
        }
      })
      if (!test5) return

      // Test 6: Firestore Connection
      const test6 = await runTest('Firestore Connection', async () => {
        try {
          const { getFirestore, getApps, initializeApp } = await import('firebase/firestore')
          const { initializeApp: initApp, getApps: getAppsList } = await import('firebase/app')
          return true
        } catch {
          return false
        }
      })
      if (!test6) return

      // Test 7: Environment Variables
      const test7 = await runTest('Environment Variables', async () => {
        const vars = [
          'NEXT_PUBLIC_FIREBASE_API_KEY',
          'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
          'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        ]
        return vars.every(v => !!process.env[v])
      })
      if (!test7) return

      setAllPassed(true)
    }

    runAllTests()
  }, [])

  const TestStatus = ({ passed }: { passed: boolean | undefined }) => {
    if (passed === undefined) return <Loader2 className="w-5 h-5 animate-spin" />
    if (passed) return <CheckCircle2 className="w-5 h-5 text-green-500" />
    return <XCircle className="w-5 h-5 text-red-500" />
  }

  if (allPassed) {
    return (
      <div className="h-screen p-8 bg-green-50">
        <Card className="max-w-2xl mx-auto p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <h1 className="text-2xl font-bold text-green-700">All Tests Passed!</h1>
          </div>
          <p className="mb-4">The issue is likely in your component logic. Common causes:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Incorrect Firestore collection paths</li>
            <li>Security rules blocking access</li>
            <li>User not authenticated properly</li>
            <li>Missing data in Firestore</li>
          </ul>
          <div className="mt-6 p-4 bg-blue-50 rounded">
            <p className="font-semibold mb-2">Next Steps:</p>
            <p>1. Check browser console for specific Firestore errors</p>
            <p>2. Verify your security rules allow reads</p>
            <p>3. Check if user document exists at /users/{'{email}'}</p>
          </div>
          <Button 
            className="mt-6"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen p-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Running Diagnostics...</h1>
        
        <div className="space-y-3">
          {[
            'UI Components',
            'Lucide Icons', 
            'Date-fns',
            'Firebase Module',
            'Firebase Init',
            'Firestore Connection',
            'Environment Variables'
          ].map(testName => (
            <div key={testName} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">{testName}</span>
              <TestStatus passed={testResults[testName]} />
            </div>
          ))}
        </div>

        {currentTest && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-700">Testing: {currentTest}...</p>
          </div>
        )}

        {Object.entries(testResults).some(([key, value]) => key.includes('_error') && !value) && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-red-700">Errors Detected</h3>
            </div>
            {Object.entries(testResults)
              .filter(([key]) => key.includes('_error'))
              .map(([key, error]) => (
                <div key={key} className="mt-2">
                  <p className="text-sm font-medium">{key.replace('_error', '')}:</p>
                  <pre className="text-xs mt-1 p-2 bg-red-100 rounded overflow-auto">
                    {String(error)}
                  </pre>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <DiagnosticPage />
    </Suspense>
  )
}