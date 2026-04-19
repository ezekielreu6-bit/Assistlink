"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, UserPlus, Mail, Shield, MoreHorizontal, Loader2, Trash2, Users } from 'lucide-react'
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, where, doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { sendTeamInvitation } from '@/app/actions/email'

export default function TeamPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'agent' | 'admin'>('agent')
  const [isInviting, setIsInviting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<'agent' | 'admin' | null>(null)

  // Smart Organization & Role Detection
  useEffect(() => {
    async function getOrgContext() {
      if (!user?.email || !db) return

      const userEmail = user.email.toLowerCase()
      const userDocRef = doc(db, 'users', userEmail)
      const userSnap = await getDoc(userDocRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        const orgId = userData.organizationId

        setCurrentOrgId(orgId)
        setCurrentUserRole(userData.role || 'agent')

        // Check if this user is the owner (either no orgId or orgId matches their email pattern)
        const isOrgOwner = !orgId || orgId === userEmail.replace(/\./g, '_')
        setIsOwner(isOrgOwner)
      } else {
        // New user fallback (treat as owner)
        const fallbackOrgId = userEmail.replace(/\./g, '_')
        setCurrentOrgId(fallbackOrgId)
        setIsOwner(true)
        setCurrentUserRole('admin')
      }
    }

    getOrgContext()
  }, [user, db])

  // Query team members
  const teamQuery = useMemoFirebase(() => {
    if (!db || !currentOrgId) return null
    return query(
      collection(db, 'users'),
      where('organizationId', '==', currentOrgId)
    )
  }, [db, currentOrgId])

  const { data: teamMembers = [], isLoading } = useCollection(teamQuery)

  // Only owners/admins can invite and manage
  const canManageTeam = isOwner || currentUserRole === 'admin'

  // Invite Handler
  const handleInvite = async () => {
    if (!inviteEmail.trim() || !db || !currentOrgId || !canManageTeam) return

    // Free tier limit
    if (teamMembers.length >= 5) {
      toast({
        title: "Limit Reached",
        description: "Free plan allows maximum 5 team members.",
        variant: "destructive"
      })
      return
    }

    setIsInviting(true)

    try {
      const inviteId = `inv_\( {Date.now().toString(36)} \){Math.random().toString(36).substring(2)}`
      const inviterName = user?.displayName || user?.email?.split('@')[0] || 'Admin'

      // Send email invitation
      const emailResult = await sendTeamInvitation(
        inviteEmail.trim(), 
        inviteRole, 
        inviterName, 
        inviteId
      )

      if (!emailResult.success) throw new Error("Failed to send email")

      // Save invitation
      await setDoc(doc(db, 'invitations', inviteId), {
        email: inviteEmail.toLowerCase().trim(),
        role: inviteRole,
        orgId: currentOrgId,
        inviterName,
        status: 'pending',
        createdAt: serverTimestamp()
      })

      // Create placeholder user document
      await setDoc(doc(db, 'users', inviteEmail.toLowerCase().trim()), {
        email: inviteEmail.toLowerCase().trim(),
        role: inviteRole,
        organizationId: currentOrgId,
        status: 'invited',
        inviteId,
        invitedBy: user?.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      toast({ 
        title: "Invitation Sent ✓", 
        description: `Invite sent to ${inviteEmail}` 
      })

      setInviteEmail('')
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Invitation Failed",
        description: "Could not send invitation. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleDeleteMember = async (memberEmail: string, inviteId?: string) => {
    if (!db || !currentOrgId || !canManageTeam) return
    if (memberEmail.toLowerCase() === user?.email?.toLowerCase()) {
      toast({ title: "Cannot remove yourself", variant: "destructive" })
      return
    }

    if (!confirm(`Remove ${memberEmail} from the team?`)) return

    try {
      await deleteDoc(doc(db, 'users', memberEmail.toLowerCase().trim()))
      if (inviteId) await deleteDoc(doc(db, 'invitations', inviteId))

      toast({ title: "Member removed successfully" })
    } catch (error) {
      toast({ title: "Failed to remove member", variant: "destructive" })
    }
  }

  // If we still don't know the org, show loading
  if (!currentOrgId) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#3333CC]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#3333CC] flex items-center gap-3">
            <Users className="w-8 h-8" />
            Team
          </h1>
          <p className="text-muted-foreground">
            {canManageTeam 
              ? "Manage your support team and permissions" 
              : "Your team members"}
          </p>
        </div>

        {canManageTeam && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#3333CC] hover:bg-[#2a2aa3] h-11 gap-2 shadow-lg">
                <UserPlus className="w-4 h-4" />
                Invite Member
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  {teamMembers.length >= 5 
                    ? "Free plan limit reached (5 members)" 
                    : `${teamMembers.length} of 5 free seats used`}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="agent@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'agent' | 'admin')}
                    className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary"
                  >
                    <option value="agent">Support Agent</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  onClick={handleInvite}
                  disabled={isInviting || !inviteEmail.trim() || teamMembers.length >= 5}
                  className="w-full h-12 rounded-xl bg-[#3333CC]"
                >
                  {isInviting ? (
                    <>Sending <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
                  ) : (
                    <>Send Invitation <Mail className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Agent View Banner */}
      {!canManageTeam && (
        <Card className="border-l-4 border-l-[#3333CC] bg-blue-50/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              You are an <span className="font-semibold text-[#3333CC]">Agent</span> in this organization.
              Contact your administrator if you need to invite new team members.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Team Table / Cards */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            Team Members ({teamMembers.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-8">Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#3333CC]" />
                    </TableCell>
                  </TableRow>
                ) : teamMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                      No team members yet
                    </TableCell>
                  </TableRow>
                ) : (
                  teamMembers.map((member: any) => (
                    <TableRow key={member.id} className="hover:bg-muted/50">
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 ring-2 ring-white">
                            <AvatarFallback className="bg-[#3333CC]/10 text-[#3333CC] font-semibold">
                              {member.email?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.firstName || member.email?.split('@')[0]}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize font-medium text-sm">
                        {member.role}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.status === 'invited' ? "secondary" : "default"} className="rounded-full">
                          {member.status === 'invited' ? 'Pending' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        {canManageTeam && member.email !== user?.email && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                              <DropdownMenuItem 
                                className="text-red-600 cursor-pointer"
                                onClick={() => handleDeleteMember(member.email, member.inviteId)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove from team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4 p-4">
            {teamMembers.map((member: any) => (
              <Card key={member.id} className="p-5 rounded-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-[#3333CC]/10 text-[#3333CC]">
                        {member.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{member.email}</p>
                      <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>

                  {canManageTeam && member.email !== user?.email && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteMember(member.email, member.inviteId)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Badge variant={member.status === 'invited' ? "secondary" : "default"}>
                    {member.status === 'invited' ? 'Pending Invitation' : 'Active'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}