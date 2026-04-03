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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, UserPlus, Mail, Shield, MoreHorizontal, Loader2, Trash2, AlertCircle } from 'lucide-react'
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
    return query(collection(db, 'users'), where('organizationId', '==', orgId))
  }, [db, orgId])

  const { data: teamMembers, isLoading } = useCollection(teamQuery)

  const handleDeleteMember = async (memberId: string, inviteId?: string) => {
    if (!db || !orgId) return
    if (memberId === user?.email) {
      toast({ title: "Error", description: "You cannot delete yourself.", variant: "destructive" })
      return
    }
    if (!window.confirm(`Remove ${memberId} from team?`)) return

    try {
      await deleteDoc(doc(db, 'users', memberId))
      if (inviteId) await deleteDoc(doc(db, 'invitations', inviteId))
      toast({ title: "Member removed" })
    } catch (error) {
      console.error("Delete error:", error)
      toast({ title: "Delete failed", variant: "destructive" })
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail || !db || !user || !orgId) return
    
    setIsInviting(true)
    try {
      const inviteId = Math.random().toString(36).substring(2, 15)
      const inviterName = user.displayName || user.email?.split('@')[0] || 'Admin'

      // 1. Send Email
      const emailResult = await sendTeamInvitation(inviteEmail, inviteRole, inviterName, inviteId)
      if (!emailResult.success) throw new Error("EMAIL_FAILED")

      // 2. Save Invitation
      await setDoc(doc(db, 'invitations', inviteId), {
        email: inviteEmail.toLowerCase().trim(),
        role: inviteRole,
        orgId: orgId,
        inviterName: inviterName,
        status: 'pending',
        createdAt: serverTimestamp()
      })

      // 3. Save User Placeholder
      await setDoc(doc(db, 'users', inviteEmail.toLowerCase().trim()), {
        email: inviteEmail.toLowerCase().trim(),
        role: inviteRole,
        organizationId: orgId,
        status: 'invited',
        inviteId: inviteId,
        invitedBy: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      toast({ title: "Invitation sent successfully" })
      setInviteEmail('')
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("FULL INVITE ERROR:", error) // CHECK YOUR BROWSER CONSOLE FOR THIS
      toast({ 
        title: "Error", 
        description: error.message === "EMAIL_FAILED" 
          ? "Could not send email." 
          : "Database error. Check your Firestore rules or Admin status.", 
        variant: "destructive" 
      })
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#3333CC]">Team Management</h1>
          <p className="text-sm text-muted-foreground">Manage your organization members.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2 bg-[#3333CC] hover:bg-[#3333CC]/90 shadow-lg shadow-primary/20">
              <UserPlus className="w-4 h-4" /> Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Invite Teammate</DialogTitle>
              <DialogDescription>Sent to: {inviteEmail || '...'}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input placeholder="email@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select className="w-full h-10 rounded-xl border bg-background px-3" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                  <option value="agent">Support Agent</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleInvite} disabled={isInviting || !inviteEmail} className="w-full rounded-xl h-12 bg-[#3333CC]">
                {isInviting ? <Loader2 className="animate-spin mr-2" /> : <Mail className="mr-2 w-4 h-4" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-2xl bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="px-6">Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : teamMembers?.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/5">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{member.email?.[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{member.firstName || member.email?.split('@')[0]}</span>
                        <span className="text-[10px] text-muted-foreground">{member.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-xs font-medium">{member.role}</TableCell>
                  <TableCell>
                    <Badge className={cn("rounded-full px-3 text-[10px] uppercase font-bold", 
                      member.status === 'invited' ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : "bg-green-100 text-green-700 hover:bg-green-100")}>
                      {member.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem className="text-destructive cursor-pointer" onSelect={() => handleDeleteMember(member.id, member.inviteId)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Remove Member
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
    </div>
  )
}