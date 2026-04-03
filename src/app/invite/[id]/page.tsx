"use client"

import { useEffect, useState, use } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { db, useUser } from '@/firebase'
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'

export default function InvitePage() {
  const params = useParams()
  const id = params?.id as string
  
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  
  const [invite, setInvite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 1. Fetch the invitation details
  useEffect(() => {
    if (!isMounted || !id || !db) return

    async function fetchInvite() {
      try {
        const snap = await getDoc(doc(db, 'invitations', id))
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
        console.error("Fetch error:", err)
        setError("Failed to load invitation. Please check your connection.")
      } finally {
        setLoading(false)
      }
    }
    fetchInvite()
  }, [isMounted, id, db])

  // 2. Handle Redirect if not logged in (only after invite is loaded)
  useEffect(() => {
    if (isMounted && !authLoading && !user && !loading && !error) {
      const currentPath = window.location.pathname
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [isMounted, user, authLoading, loading, error, router])

  const handleAccept = async () => {
    if (!user || !invite || !id || !db) return
    
    // Safety check: Ensure the logged-in user is the one who was invited
    if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
      alert(`This invite was sent to ${invite.email}. You are currently logged in as ${user.email}. Please switch accounts.`)
      return
    }

    setProcessing(true)
    try {
      // Update/Create the user's profile to join the organization
      await setDoc(doc(db, 'users', user.email!.toLowerCase()), {
        email: user.email?.toLowerCase(),
        organizationId: invite.orgId,
        role: invite.role,
        status: 'active',
        updatedAt: serverTimestamp(),
        joinedAt: serverTimestamp()
      }, { merge: true })

      // Mark invite as accepted
      await updateDoc(doc(db, 'invitations', id), { 
        status: 'accepted',
        acceptedBy: user.email,
        acceptedAt: serverTimestamp()
      })

      router.push('/dashboard')
    } catch (e) {
      console.error("Accept error:", e)
      alert("Failed to join the team. Check your internet and try again.")
    } finally {
      setProcessing(false)
    }
  }

  if (!isMounted) return null

  // Show loader while checking auth or fetching invite
  if (authLoading || loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#F0F0F4]">
        <Loader2 className="w-8 h-8 animate-spin text-[#3333CC]" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Verifying invitation...</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-[#F0F0F4]">
        <Card className="max-w-md w-full rounded-[2rem] shadow-xl border-none text-center p-10 bg-white">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold mb-2">Invite Error</CardTitle>
          <p className="text-muted-foreground mb-8 leading-relaxed">{error}</p>
          <Button onClick={() => router.push('/')} variant="outline" className="w-full h-12 rounded-xl border-2">
            Back to Home
          </Button>
        </Card>
      </div>
    )
  }

  // If not logged in, show a "Sign in" prompt instead of just redirecting (better UX)
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-[#F0F0F4]">
        <Card className="max-w-md w-full rounded-[2rem] shadow-xl border-none text-center p-10 bg-white">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold mb-2">Almost there!</CardTitle>
          <p className="text-muted-foreground mb-8">You need to sign in to your AssistLink account to accept this invitation.</p>
          <Button onClick={() => router.push(`/login?redirect=/invite/${id}`)} className="w-full h-14 rounded-2xl bg-[#3333CC] text-lg font-bold">
            Sign in to Accept <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#F0F0F4] p-4">
      <Card className="max-w-md w-full rounded-[2.5rem] shadow-2xl border-none overflow-hidden animate-in fade-in zoom-in duration-500 bg-white">
        <div className="h-3 w-full bg-[#3333CC]" />
        <CardHeader className="text-center pt-10 px-8">
          <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-3">
            <CheckCircle2 className="w-12 h-12 text-[#3333CC] -rotate-3" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-foreground">Join the Team</CardTitle>
          <div className="mt-4 space-y-2">
            <p className="text-muted-foreground text-lg">
              <span className="font-bold text-foreground">{invite.inviterName}</span> invited you
            </p>
            <Badge className="bg-[#F0F0F4] text-[#3333CC] hover:bg-[#F0F0F4] border-none rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-widest">
              {invite.role} Access
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-10 pt-6">
          <div className="bg-muted/30 rounded-2xl p-5 mb-8 border border-dashed border-muted-foreground/20">
            <p className="text-[10px] text-muted-foreground mb-1 uppercase font-black tracking-[0.2em]">Confirming Account</p>
            <p className="font-bold text-sm truncate text-foreground">{user?.email}</p>
          </div>

          <Button 
            className="w-full h-16 rounded-[1.25rem] bg-[#3333CC] hover:bg-[#3333CC]/90 text-white text-xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
            onClick={handleAccept}
            disabled={processing}
          >
            {processing ? (
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin w-6 h-6" />
                <span>Joining...</span>
              </div>
            ) : (
              "Accept Invitation"
            )}
          </Button>

          <p className="text-center text-[10px] text-muted-foreground mt-8 uppercase tracking-[0.3em] font-bold opacity-50">
            Secure Team Invitation
          </p>
        </CardContent>
      </Card>
    </div>
  )
}