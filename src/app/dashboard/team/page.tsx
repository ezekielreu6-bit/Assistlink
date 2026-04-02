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
import { Search, UserPlus, Mail, Shield, MoreHorizontal, Loader2 } from 'lucide-react'
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function TeamPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('agent')
  const [isInviting, setIsInviting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const teamQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(
      collection(db, 'users'),
      where('organizationId', '==', 'default-org')
    )
  }, [db])

  const { data: teamMembers, isLoading } = useCollection(teamQuery)

  const handleInvite = async () => {
    if (!inviteEmail) return
    setIsInviting(true)
    try {
      // In a real app, this would trigger a Nodemailer invite flow
      // For now, we simulate adding a placeholder user record
      await addDoc(collection(db, 'users'), {
        email: inviteEmail,
        role: inviteRole,
        organizationId: 'default-org',
        status: 'invited',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      toast({
        title: "Invitation sent",
        description: `We've sent an invitation to ${inviteEmail}.`
      })
      setInviteEmail('')
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation.",
        variant: "destructive"
      })
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-1">Manage your support agents and administrative staff.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
              <UserPlus className="w-4 h-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
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
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
                className="w-full rounded-xl"
              >
                {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invitation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search members..." className="pl-10 h-11 rounded-xl bg-white border-none shadow-sm" />
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
                        <AvatarFallback>{member.email[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{member.firstName || member.email.split('@')[0]}</span>
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
