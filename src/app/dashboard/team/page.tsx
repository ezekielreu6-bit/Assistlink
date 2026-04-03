"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, UserPlus, Mail, Shield, MoreHorizontal, Loader2, Calendar } from 'lucide-react'
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
// Ensure this path matches where you saved the email action
import { sendTeamInvitation } from '@/lib/email-action' 

export default function TeamPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('agent')
  const [isInviting, setIsInviting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Consistent orgId logic (matches your widget and rules)
  const orgId = user?.email ? user.email.replace(/\./g, '_') : 'default-org'

  const teamQuery = useMemoFirebase(() => {
    if (!db || !orgId) return null
    return query(
      collection(db, 'users'),
      where('organizationId', '==', orgId)
    )
  }, [db, orgId])

  const { data: teamMembers, isLoading } = useCollection(teamQuery)

  const handleInvite = async () => {
    if (!inviteEmail || !db || !user || !orgId) {
       toast({ title: "Error", description: "Missing required information.", variant: "destructive" })
       return
    }
    
    setIsInviting(true)
    try {
      // 1. Call the Server Action to send the actual email
      const inviterName = user.displayName || user.email?.split('@')[0] || 'A Teammate'
      const emailResult = await sendTeamInvitation(inviteEmail, inviteRole, inviterName)

      if (!emailResult.success) {
        throw new Error("SMTP_ERROR")
      }

      // 2. If email sent successfully, record the invitation in Firestore
      await addDoc(collection(db, 'users'), {
        email: inviteEmail.toLowerCase().trim(),
        role: inviteRole,
        organizationId: orgId,
        status: 'invited',
        invitedBy: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      toast({
        title: "Invitation sent",
        description: `An email has been sent to ${inviteEmail}.`
      })
      
      // Reset UI
      setInviteEmail('')
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Invite error:", error)
      
      const isSmtpError = error.message === "SMTP_ERROR"
      
      toast({
        title: "Invitation Failed",
        description: isSmtpError 
          ? "The email could not be sent. Please check your SMTP/Gmail App Password settings in Vercel." 
          : "We couldn't save the invitation. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your support agents and administrative staff.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto rounded-xl gap-2 shadow-lg shadow-primary/20 h-11">
              <UserPlus className="w-4 h-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] w-[92vw] rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Invite a teammate</DialogTitle>
              <DialogDescription>
                Teammates will receive an email to join your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="teammate@company.com" 
                    className="pl-10 rounded-xl"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select 
                  id="role"
                  className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="agent">Support Agent</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleInvite} 
                disabled={isInviting || !inviteEmail}
                className="w-full rounded-xl h-12"
              >
                {isInviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                {isInviting ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ... rest of your table UI code ... */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search members..." className="pl-10 h-11 rounded-xl bg-white border-none shadow-sm w-full" />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="px-6 h-12">Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : teamMembers?.map((member) => (
                <TableRow key={member.id} className="group hover:bg-muted/10 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                        <AvatarImage src={`https://picsum.photos/seed/${member.id}/80/80`} />
                        <AvatarFallback>{member.email?.[0].toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{member.firstName || member.email?.split('@')[0] || 'New Member'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm font-medium">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-semibold capitalize">
                      <Shield className={cn("w-3.5 h-3.5", member.role === 'admin' ? "text-purple-600" : "text-blue-600")} />
                      {member.role}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={member.status === 'invited' ? 'secondary' : 'default'} 
                      className={cn(
                        "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        member.status === 'invited' ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                      )}
                    >
                      {member.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-medium">
                    {member.createdAt ? format(member.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}