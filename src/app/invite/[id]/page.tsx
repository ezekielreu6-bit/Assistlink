"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { db, useUser } from '@/firebase'
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function InvitePage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  
  const [invite, setInvite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      // Save current path so login page can redirect back here
      const currentPath = window.location.pathname
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [user, authLoading, router])

  // 2. Fetch the invitation details
  useEffect(() => {
    async function fetchInvite() {
      if (!id) return
      try {
        const snap = await getDoc(doc(db, 'invitations', id as string))
        if (snap.exists()) {
          const data = snap.data()
          if (data.status === 'accepted') {
            setError("This invitation has already been used.")
          } else {
            setInvite(data)
          }
        } else {
          setError("This invitation link is invalid or has expired.")
        }
      } catch (err) {
        setError("Failed to load invitation.")
      } finally {
        setLoading(false)
      }
    }
    fetchInvite()
  }, [id])

  const handleAccept = async () => {
    if (!user || !invite || !id) return
    
    // Safety check: Ensure the logged-in user is the one who was invited
    if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
      alert(`This invite was sent to ${invite.email}. Please log in with that account to accept.`)
      return
    }

    setProcessing(true)
    try {
      // Update/Create the user's profile to join the organization
      await setDoc(doc(db, 'users', user.email!), {
        email: user.email,
        organizationId: invite.orgId,
        role: invite.role,
        status: 'active',
        joinedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true })

      // Mark invite as accepted in the invitations collection
      await updateDoc(doc(db, 'invitations', id as string), { 
        status: 'accepted',
        acceptedBy: user.email,
        acceptedAt: serverTimestamp()
      })

      router.push('/dashboard')
    } catch (e) {
      console.error("Accept error:", e)
      alert("Failed to join the team. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  // Show loader while checking auth or fetching invite
  if (authLoading || loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Verifying invitation...</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl shadow-xl border-none text-center p-8">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <CardTitle className="mb-2">Invitation Error</CardTitle>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')} variant="outline" className="rounded-xl">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  // If user is logged in and invite is valid, show the Accept UI
  return (
    <div className="h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full rounded-[2rem] shadow-2xl border-none overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="h-2 w-full bg-primary" />
        <CardHeader className="text-center pt-8">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <CheckCircle2 className="w-10 h-10 text-primary -rotate-3" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Join the Team</CardTitle>
          <div className="mt-4 space-y-1">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{invite.inviterName}</span> has invited you to join
            </p>
            <Badge variant="secondary" className="rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {invite.role} Role
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 pt-4">
          <div className="bg-muted/50 rounded-2xl p-4 mb-8 text-center">
            <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-widest">Logged in as</p>
            <p className="font-medium text-sm">{user?.email}</p>
          </div>

          <Button 
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
            onClick={handleAccept}
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Joining Team...
              </>
            ) : (
              "Accept & Continue"
            )}
          </Button>
          
          <p className="text-center text-[10px] text-muted-foreground mt-6 uppercase tracking-widest font-medium">
            Secure Invitation by AssistLink
          </p>
        </CardContent>
      </Card>
    </div>
  )
}