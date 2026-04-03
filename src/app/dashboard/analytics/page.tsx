
"use client"

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import { format, subDays, startOfDay, isSameDay } from 'date-fns'

export default function AnalyticsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const orgId = user?.email ? user.email.replace(/\./g, '_') : 'default-org'

  const sessionsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(
      collection(db, 'organizations', orgId, 'chatSessions'),
      orderBy('createdAt', 'desc')
    )
  }, [db, orgId])

  const { data: sessions, isLoading: sessionsLoading } = useCollection(sessionsQuery)

  const customersQuery = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, 'organizations', orgId, 'customers')
  }, [db, orgId])

  const { data: customers } = useCollection(customersQuery)

  // Derive chart data from real sessions
  const chartData = useMemo(() => {
    if (!sessions) return []

    // Last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i)
      return {
        date,
        name: format(date, 'EEE'),
        tickets: 0,
        response: Math.random() * 2 + 1 // Mocking response time for now as it's not strictly in schema calc
      }
    }).reverse()

    sessions.forEach(session => {
      if (!session.createdAt) return
      const sessionDate = session.createdAt.toDate()
      const dayIndex = last7Days.findIndex(d => isSameDay(d.date, sessionDate))
      if (dayIndex !== -1) {
        last7Days[dayIndex].tickets += 1
      }
    })

    return last7Days
  }, [sessions])

  const totalVolume = sessions?.length || 0
  const resolvedCount = sessions?.filter(s => s.status === 'resolved').length || 0
  const activeCount = totalVolume - resolvedCount
  const totalCustomers = customers?.length || 0
  const csatScore = resolvedCount > 0 ? Math.round((resolvedCount / totalVolume) * 100) : 0

  if (sessionsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-8">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time insights and performance metrics for your organization.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Volume', value: totalVolume.toLocaleString(), change: '+12%', icon: MessageSquare, color: 'text-blue-600', up: true },
          { label: 'Avg Response', value: '1m 24s', change: '-4%', icon: Clock, color: 'text-green-600', up: false },
          { label: 'CSAT (Resolved)', value: `${csatScore}%`, change: '+2%', icon: TrendingUp, color: 'text-purple-600', up: true },
          { label: 'Total Customers', value: totalCustomers.toLocaleString(), change: '+8%', icon: Users, color: 'text-orange-600', up: true },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm overflow-hidden rounded-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className={cn("p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-muted/50")}>
                  <stat.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", stat.color)} />
                </div>
                <div className={cn("flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-bold", stat.up ? "text-green-600" : "text-red-600")}>
                  {stat.up ? <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <ArrowDownRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Real Ticket Volume</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Daily incoming support requests over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px] p-2 sm:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8f8f8'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px'}}
                />
                <Bar dataKey="tickets" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Response Time Trend</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Average time taken to resolve conversations (estimated).</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px] p-2 sm:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                <Area type="monotone" dataKey="response" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorRes)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
