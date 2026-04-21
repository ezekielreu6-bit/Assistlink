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
  Settings,
  Users
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

  const orgId = user?.email ? user.email.replace(/\./g, '_') : null

  const sessionsQuery = useMemoFirebase(() => {
    if (!db || !orgId) return null
    return query(
      collection(db, 'organizations', orgId, 'chatSessions'),
      orderBy('updatedAt', 'desc')
    )
  }, [db, orgId])

  const recentSessionsQuery = useMemoFirebase(() => {
    if (!db || !orgId) return null
    return query(
      collection(db, 'organizations', orgId, 'chatSessions'),
      orderBy('updatedAt', 'desc'),
      limit(6)
    )
  }, [db, orgId])

  const allSessionsResult = useCollection(sessionsQuery)
  const recentSessionsResult = useCollection(recentSessionsQuery)

  const allSessions = allSessionsResult?.data || []
  const recentSessions = recentSessionsResult?.data || []
  const loading = allSessionsResult?.isLoading || recentSessionsResult?.isLoading || false

  const activeCount = allSessions.filter(s => s.status !== 'resolved').length || 0
  const resolvedCount = allSessions.filter(s => s.status === 'resolved').length || 0

  const stats = [
    { 
      label: 'Active Chats', 
      value: activeCount, 
      icon: MessageSquare, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Resolved Today', 
      value: resolvedCount, 
      icon: CheckCircle2, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      label: 'Total Conversations', 
      value: allSessions.length, 
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
    { 
      label: 'Team Members', 
      value: '—', 
      icon: Users, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
  ]

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage all customer conversations in one place.</p>
        </div>
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/dashboard/settings">
            <Settings className="w-4 h-4 mr-2" />
            Widget Settings
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow transition-all rounded-3xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-4xl font-semibold mt-2 tracking-tighter">{stat.value}</p>
                </div>
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="lg:col-span-4 border-none shadow-sm rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>Latest customer messages needing attention</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/chat">View All →</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : recentSessions.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No conversations yet. When customers message you, they'll appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((chat: any) => (
                  <Link 
                    key={chat.id} 
                    href={`/dashboard/chat?session=${chat.id}`}
                    className="flex gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-all group border border-transparent hover:border-zinc-100"
                  >
                    <Avatar className="h-11 w-11 flex-shrink-0">
                      <AvatarFallback className="bg-zinc-100 text-zinc-600">
                        {chat.customerName?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">
                          {chat.customerName || 'Anonymous Customer'}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {chat.updatedAt ? formatDistanceToNow(chat.updatedAt.toDate(), { addSuffix: true }) : 'Just now'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {chat.lastMessage || 'New conversation started'}
                      </p>
                    </div>

                    {chat.status !== 'resolved' && (
                      <div className="w-2 h-2 mt-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3 border-none shadow-sm bg-gradient-to-br from-zinc-900 to-black text-white rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-zinc-400">Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full h-12 bg-white text-black hover:bg-zinc-100 justify-start rounded-2xl">
              <Link href="/dashboard/team">
                <UserPlus className="mr-3 h-5 w-5" />
                Invite Team Member
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full h-12 border-white/30 text-white hover:bg-white/10 justify-start rounded-2xl">
              <Link href="/dashboard/settings">
                <Settings className="mr-3 h-5 w-5" />
                Customize Widget
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full h-12 border-white/30 text-white hover:bg-white/10 justify-start rounded-2xl">
              <Link href="/dashboard/chat">
                <MessageSquare className="mr-3 h-5 w-5" />
                Go to Live Chat
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}