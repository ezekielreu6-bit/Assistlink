"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ThumbsUp, 
  ArrowUpRight,
  UserPlus
} from 'lucide-react'
import { mockStats, mockChats } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

export default function DashboardOverview() {
  const stats = [
    { label: 'Active Chats', value: mockStats.activeChats, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Resolved Today', value: mockStats.resolvedToday, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Avg. Response', value: mockStats.avgResponseTime, icon: Clock, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'CSAT Score', value: mockStats.satisfactionRate, icon: ThumbsUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Alex!</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your support tickets today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className={cn("p-2 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                <span className="text-[10px] text-green-600 font-bold">+12%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>You have 3 incoming messages that need attention.</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/chat">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockChats.slice(0, 3).map((chat) => (
                <div key={chat.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-colors group">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>{chat.customerName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{chat.customerName}</p>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{chat.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 italic">"{chat.lastMessage}"</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm bg-primary text-white overflow-hidden relative">
          <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
          
          <CardHeader className="relative">
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-white/70">Manage your workspace easily.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <Button className="w-full bg-white text-primary hover:bg-white/90 justify-start h-12 rounded-xl shadow-lg">
              <UserPlus className="w-4 h-4 mr-3" />
              Invite Team Member
            </Button>
            <Button variant="outline" className="w-full border-white/30 hover:bg-white/10 text-white justify-start h-12 rounded-xl">
              <MessageSquare className="w-4 h-4 mr-3" />
              Create Auto-Response
            </Button>
            <div className="pt-4 border-t border-white/10 mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Today's Goal</p>
              <div className="flex items-center justify-between text-xs mb-2">
                <span>Resolve 60 Tickets</span>
                <span className="font-bold">80%</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-accent w-[80%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
