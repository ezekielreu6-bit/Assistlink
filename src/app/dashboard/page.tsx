"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ThumbsUp, 
  UserPlus,
  Loader2,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, limit, orderBy } from 'firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

export default function DashboardOverview() {
  const { user } = useUser()
  const db = useFirestore()

  // Safe orgId calculation
  const orgId = user?.email ? user.email.replace(/\./g, '_') : null

  // Sessions queries - only run when orgId exists
  const sessionsQuery = useMemoFirebase(() => {
    if (!db || !orgId) return null
    return query(
      collection(db, 'organizations', orgId, 'chatSessions'),
      orderBy('updatedAt', 'desc')
    )
  }, [db, orgId])

  const activeSessionsQuery = useMemoFirebase(() => {
    if (!db || !orgId) return null
    return query(
      collection(db, 'organizations', orgId, 'chatSessions'),
      orderBy('updatedAt', 'desc'),
      limit(5)
    )
  }, [db, orgId])

  const allSessionsResult = useCollection(sessionsQuery)
  const recentSessionsResult = useCollection(activeSessionsQuery)

  const allSessions = allSessionsResult?.data || []
  const recentSessions = recentSessionsResult?.data || []
  const loadingSessions = allSessionsResult?.isLoading || recentSessionsResult?.isLoading || false

  const activeCount = allSessions.filter(s => s.status !== 'resolved').length || 0
  const resolvedCount = allSessions.filter(s => s.status === 'resolved').length || 0

  const stats = [
    { label: 'Active Chats', value: activeCount, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Resolved (Total)', value: resolvedCount, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Volume', value: allSessions.length || 0, icon: Clock, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Health Score', value: '98%', icon: ThumbsUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, Agent!</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Here's a live look at your support performance.</p>
        </div>
        <Button variant="outline" className="rounded-xl hidden sm:flex border-none shadow-sm bg-white" asChild>
          <Link href="/dashboard/settings">
            <Settings className="w-4 h-4 mr-2" />
            Widget Settings
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate">{stat.label}</p>
                <div className={cn("p-1.5 sm:p-2 rounded-lg sm:rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-3 w-3 sm:h-4 sm:w-4", stat.color)} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
                <span className="hidden sm:inline text-[10px] text-green-600 font-bold uppercase tracking-tighter">Live</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm rounded-2xl bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest incoming messages needing attention.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary/5">
                <Link href="/dashboard/chat">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingSessions ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {recentSessions?.map((chat: any) => (
                  <Link 
                    key={chat.id} 
                    href={`/dashboard/chat?session=${chat.id}`} 
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-colors group"
                  >
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-white shadow-sm">
                      <AvatarFallback>{chat.customerName?.[0] || 'C'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                          {chat.customerName || 'Anonymous'}
                        </p>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          {chat.updatedAt ? formatDistanceToNow(chat.updatedAt.toDate()) : 'Now'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 italic">
                        "{chat.lastMessage || 'New session'}"
                      </p>
                    </div>
                  </Link>
                ))}
                {(!recentSessions || recentSessions.length === 0) && (
                  <p className="text-center text-muted-foreground text-sm py-8 italic">
                    No recent messages yet.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm bg-primary text-white overflow-hidden relative rounded-2xl">
          <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-accent/20 rounded-full blur-2xl" />

          <CardHeader className="relative">
            <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-white/70 text-xs">Manage your workspace easily.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <Button 
              className="w-full bg-white text-primary hover:bg-white/90 justify-start h-11 sm:h-12 rounded-xl shadow-lg text-sm border-none"
              asChild
            >
              <Link href="/dashboard/team">
                <UserPlus className="w-4 h-4 mr-3" />
                Invite Team Member
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-white/30 hover:bg-white/10 text-white justify-start h-11 sm:h-12 rounded-xl text-sm"
              asChild
            >
              <Link href="/dashboard/settings">
                <MessageSquare className="w-4 h-4 mr-3" />
                Customize Widget
              </Link>
            </Button>
            <div className="pt-4 border-t border-white/10 mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Today's Progress</p>
              <div className="flex items-center justify-between text-xs mb-2">
                <span>Active Management</span>
                <span className="font-bold">{activeCount > 0 ? 'Active' : 'Idle'}</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent" 
                  style={{ width: allSessions.length ? `${(resolvedCount / allSessions.length) * 100}%` : '0%' }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}