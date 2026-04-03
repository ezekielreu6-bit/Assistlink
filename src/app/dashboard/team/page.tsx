"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreHorizontal, 
  Loader2, 
  Calendar, 
  AlertCircle, 
  Trash2
} from 'lucide-react'
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, where, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { sendTeamInvitation } from '@/lib/email-action' 

export default function TeamPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('agent')
  const [isInviting, setIsInviting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const orgId = user?.email ? user.email.replace(/\./g, '_') : 'default-org'

  const teamQuery = useMemoFirebase(() => {
    if (!db || !orgId) return null
    return query(
      collection(db, 'users'),
      where('organizationId', '==', orgId)
    )
  }, [db, orgId])

  const { data: teamMembers, isLoading } = useCollection(teamQuery)

  // --- FIXED DELETE MEMBER LOGIC ---
  const handleDeleteMember = async (memberId: string, inviteId?: string) => {
    if (!db || !orgId) return

    if (memberId === user?.email) {
      toast({ title: "Action Denied", description: "You cannot remove yourself.", variant: "destructive" })
      return
    }

    const confirmDelete = window.confirm(`Are you sure you want to remove ${memberId}?`)
    if (!confirmDelete) return

    try {
      // Use memberId because that is the Firestore Document Name (the email)
      await deleteDoc(doc(db, 'users', memberId))

      if (inviteId) {
        await deleteDoc(doc(db, 'invitations', inviteId))
      }

      toast({ title: "Member removed", description: "Successfully updated team." })
    } catch (error: any) {
      console.error("Delete error:", error)
      toast({ 
        title: "Delete Failed", 
        description: error.code === 'permission-denied' 
          ? "You don't have permission. Are you an Admin?" 
          : "An error occurred.", 
        variant: "destructive" 
      })
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail || !db || !user || !orgId) return
    if (teamMembers && teamMembers.length >= 5) {
      toast({ title: "Limit Reached", description: "Free tier is limited to 5 members.", variant: "destructive" })
      return
    }

    setIsInviting(true)
    try {
      const inviteId = Math.random().toString(36).substring(2, 15);
      const inviterName = user.displayName || user.email?.split('@')[0] || 'A Teammate'

      const emailResult = await sendTeamInvitation(inviteEmail, inviteRole, inviterName, inviteId)
      if (!emailResult.success) throw new Error("SMTP_ERROR")

      await setDoc(doc(db, 'invitations', inviteId), {
        email: inviteEmail.toLowerCase().trim(),
        role: inviteRole,
        orgId: orgId,
        inviterName: inviterName,
        status: 'pending',
        createdAt: serverTimestamp()
      })

      // Set document ID as the email
      const userDocRef = doc(db, 'users', inviteEmail.toLowerCase().trim())
      await setDoc(userDocRef, {
        email: inviteEmail.toLowerCase().trim(),
        role: inviteRole,
        organizationId: orgId,
        status: 'invited',
        inviteId: inviteId,
        invitedBy: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      toast({ title: "Invitation sent" })
      setInviteEmail('')
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to send invitation.", variant: "destructive" })
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your support agents.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto rounded-xl gap-2 h-11">
              <UserPlus className="w-4 h-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] w-[92vw] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle>Invite a teammate</DialogTitle>
              <DialogDescription>
                {teamMembers && teamMembers.length >= 5 ? "Limit reached (5/5)" : `Using ${teamMembers?.length || 0} of 5 seats.`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Email address</Label>
                <Input 
                  placeholder="teammate@company.com" 
                  className="rounded-xl"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select 
                  className="w-full h-11 px-3 rounded-xl border bg-background text-sm"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="agent">Support Agent</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleInvite} disabled={isInviting || !inviteEmail} className="w-full rounded-xl h-12">
                {isInviting ? <Loader2 className="animate-spin mr-2" /> : <Mail className="mr-2" />}
                Send Secure Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="hidden md:block border-none shadow-sm overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="px-6 h-12">Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
              ) : teamMembers?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="px-6 py-4 font-semibold">
                    {member.firstName || member.email?.split('@')[0]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell className="capitalize">{member.role}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'invited' ? 'secondary' : 'default'}>
                      {member.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem 
                          className="text-destructive cursor-pointer"
                          // Use onSelect for Radix UI Dropdowns
                          onSelect={() => handleDeleteMember(member.id, member.inviteId)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {teamMembers?.map((member) => (
          <Card key={member.id} className="border-none shadow-sm rounded-2xl p-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="font-bold">{member.email}</span>
                <span className="text-xs text-muted-foreground capitalize">{member.role}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem 
                    className="text-destructive"
                    onSelect={() => handleDeleteMember(member.id, member.inviteId)}
                  >
                    Remove Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}