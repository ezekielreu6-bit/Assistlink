"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { db, useUser } from '@/firebase'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function InvitePage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [invite, setInvite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    async function fetchInvite() {
      if (!id) return
      const snap = await getDoc(doc(db, 'invitations', id as string))
      if (snap.exists()) setInvite(snap.data())
      setLoading(false)
    }
    fetchInvite()
  }, [id])

  const handleAccept = async () => {
    if (!user || !invite) return
    setProcessing(true)
    try {
      // Update the user's profile to join the organization
      await setDoc(doc(db, 'users', user.email!), {
        email: user.email,
        organizationId: invite.orgId,
        role: invite.role,
        status: 'active',
        joinedAt: new Date()
      }, { merge: true })

      // Mark invite as accepted
      await updateDoc(doc(db, 'invitations', id as string), { status: 'accepted' })
      
      router.push('/dashboard')
    } catch (e) {
      console.error(e)
    }
  }

  if (loading || authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  if (!invite || invite.status === 'accepted') {
    return <div className="h-screen flex items-center justify-center">This invitation is invalid or has already been used.</div>
  }

  return (
    <div className="h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full rounded-3xl shadow-xl border-none">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Join the Team</CardTitle>
          <p className="text-muted-foreground">
            {invite.inviterName} has invited you to join their organization as an <strong>{invite.role}</strong>.
          </p>
        </CardHeader>
        <CardContent>
          {!user ? (
            <Button className="w-full h-12 rounded-xl" onClick={() => router.push('/login')}>
              Sign in to Accept
            </Button>
          ) : (
            <Button 
              className="w-full h-12 rounded-xl" 
              onClick={handleAccept}
              disabled={processing}
            >
              {processing ? <Loader2 className="animate-spin mr-2" /> : null}
              Accept Invitation
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}