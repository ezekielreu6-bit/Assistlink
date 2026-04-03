"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, UserPlus, Mail, Shield, MoreHorizontal, Loader2, Trash2, AlertCircle, Calendar } from 'lucide-react'
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, where, doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { sendTeamInvitation } from '@/app/actions/email' 

export default function TeamPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('agent')
  const [isInviting, setIsInviting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)

  // 1. Determine the correct Organization ID
  useEffect(() => {
    async function getOrgContext() {
      if (!user?.email || !db) return
      
      // Check if current user is an invited member first
      const userDoc = await getDoc(doc(db, 'users', user.email.toLowerCase()))
      if (userDoc.exists() && userDoc.data().organizationId) {
        setCurrentOrgId(userDoc.data().organizationId)
      } else {
        // Fallback: This user is the owner
        setCurrentOrgId(user.email.replace(/\./g, '_'))
      }
    }
    getOrgContext()
  }, [user, db])

  // 2. Query all members of this organization
  const teamQuery = useMemoFirebase(() => {
    if (!db || !currentOrgId) return null
    return query(
      collection(db, 'users'),
      where('organizationId', '==', currentOrgId)
    )
  }, [db, currentOrgId])

  const { data: teamMembers, isLoading } = useCollection(teamQuery)

  // 3. Delete Member Logic
  const handleDeleteMember = async (memberEmail: string, inviteId?: string) => {
    if (!db || !currentOrgId) return
    if (memberEmail === user?.email) {
      toast({ title: "Action Denied", description: "You cannot remove yourself.", variant: "destructive" })
      return
    }

    if (!window.confirm(`Are you sure you want to remove ${memberEmail}?`)) return

    try {
      await deleteDoc(doc(db, 'users', memberEmail.toLowerCase()))
      if (inviteId) await deleteDoc(doc(db, 'invitations', inviteId))
      toast({ title: "Member removed" })
    } catch (error) {
      console.error("Delete error:", error)
      toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" })
    }
  }

  // 4. Invite Member Logic
  const handleInvite = async () => {
    if (!inviteEmail || !db || !user || !currentOrgId) return

    // FREE TIER LIMIT: 5 Members
    if (teamMembers && teamMembers.length >= 5) {
      toast({ title: "Limit Reached", description: "Free tier is limited to 5 members.", variant: "destructive" })
      return
    }

    setIsInviting(true)
    try {
      const inviteId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const inviterName = user.displayName || user.email?.split('@')[0] || 'Admin'

      // A. Send Email
      const emailResult = await sendTeamInvitation(inviteEmail, inviteRole, inviterName, inviteId)
      if (!emailResult.success) throw new Error("EMAIL_FAILED")

      // B. Save Invitation Record
      await setDoc(doc(db, 'invitations', inviteId), {
        email: inviteEmail.toLowerCase().trim(),
        role: inviteRole,
        orgId: currentOrgId,
        inviterName: inviterName,
        status: 'pending',
        createdAt: serverTimestamp()
      })

      // C. Save Placeholder User
      await setDoc(doc(db, 'users', inviteEmail.toLowerCase().trim()), {
        email: inviteEmail.toLowerCase().trim(),
        role: inviteRole,
        organizationId: currentOrgId,
        status: 'invited',
        inviteId: inviteId,
        invitedBy: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      toast({ title: "Invitation sent", description: `Link sent to ${inviteEmail}` })
      setInviteEmail('')
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({ title: "Invite Failed", description: "Check SMTP settings or permissions.", variant: "destructive" })
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#3333CC]">Team Management</h1>
          <p className="text-sm text-muted-foreground">Manage your support agents and roles.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto rounded-xl gap-2 bg-[#3333CC] shadow-lg shadow-primary/20 h-11">
              <UserPlus className="w-4 h-4" /> Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle>Invite a teammate</DialogTitle>
              <DialogDescription>
                {teamMembers && teamMembers.length >= 5 ? (
                  <span className="text-destructive font-bold">Limit reached (5/5)</span>
                ) : (
                  `Using ${teamMembers?.length || 0} of 5 free seats.`
                )}
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
              <Button 
                onClick={handleInvite} 
                disabled={isInviting || !inviteEmail || (teamMembers?.length || 0) >= 5}
                className="w-full rounded-xl h-12 bg-[#3333CC]"
              >
                {isInviting ? <Loader2 className="animate-spin mr-2" /> : <Mail className="mr-2 w-4 h-4" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block border-none shadow-sm overflow-hidden rounded-2xl bg-white">
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
                      member.status === 'invited' ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700")}>
                      {member.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem className="text-destructive cursor-pointer" onSelect={() => handleDeleteMember(member.email, member.inviteId)}>
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {teamMembers?.map((member) => (
          <Card key={member.id} className="border-none shadow-sm rounded-2xl p-4 bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{member.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{member.email}</span>
                  <span className="text-[10px] text-muted-foreground capitalize">{member.role}</span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteMember(member.email, member.inviteId)}>
                    Remove Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <Badge className={cn("rounded-full px-2 text-[8px] uppercase font-bold",
                member.status === 'invited' ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700")}>
                {member.status || 'Active'}
              </Badge>
              <span className="text-[10px] text-muted-foreground">Team Member</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}