
"use client"

import React from 'react'
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
  ArrowDownRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const performanceData = [
  { name: 'Mon', tickets: 40, response: 2.4 },
  { name: 'Tue', tickets: 30, response: 1.3 },
  { name: 'Wed', tickets: 20, response: 3.8 },
  { name: 'Thu', tickets: 50, response: 1.9 },
  { name: 'Fri', tickets: 90, response: 2.1 },
  { name: 'Sat', tickets: 45, response: 2.5 },
  { name: 'Sun', tickets: 35, response: 1.8 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-8">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Insights and performance metrics for your support team.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Volume', value: '1,284', change: '+12.5%', icon: MessageSquare, color: 'text-blue-600', up: true },
          { label: 'Avg Response', value: '1m 24s', change: '-4.3%', icon: Clock, color: 'text-green-600', up: false },
          { label: 'CSAT', value: '98%', change: '+2.1%', icon: TrendingUp, color: 'text-purple-600', up: true },
          { label: 'New Customers', value: '432', change: '+8.4%', icon: Users, color: 'text-orange-600', up: true },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm overflow-hidden">
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
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Ticket Volume</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Daily incoming support requests over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px] p-2 sm:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
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

        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Response Time (min)</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Average time taken to resolve conversations.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px] p-2 sm:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
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
