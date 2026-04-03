
"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MoreHorizontal, UserPlus, Filter, Loader2, Mail, Clock, Calendar } from 'lucide-react'
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

export default function CustomersPage() {
  const { user } = useUser()
  const db = useFirestore()
  const orgId = user?.email ? user.email.replace(/\./g, '_') : 'default-org'

  const customersQuery = useMemoFirebase(() => {
    if (!db || !orgId) return null
    return query(
      collection(db, 'organizations', orgId, 'customers'),
      orderBy('createdAt', 'desc')
    )
  }, [db, orgId])

  const { data: customers, isLoading } = useCollection(customersQuery)

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all customer identities interacting with your widget.</p>
        </div>
        <Button className="w-full sm:w-auto rounded-xl gap-2 shadow-lg shadow-primary/20 h-11">
          <UserPlus className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search customers..." className="pl-10 h-11 rounded-xl bg-white border-none shadow-sm w-full" />
        </div>
        <Button variant="outline" className="w-full sm:w-auto rounded-xl gap-2 h-11 bg-white border-none shadow-sm px-6">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block border-none shadow-sm overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="px-6 h-12">Customer</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Identified On</TableHead>
                <TableHead className="text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : customers?.map((customer) => (
                <TableRow key={customer.id} className="group hover:bg-muted/10 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-border/50">
                        <AvatarImage src={`https://picsum.photos/seed/${customer.id}/80/80`} />
                        <AvatarFallback>{customer.name?.[0] || 'C'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm truncate">{customer.name || 'Anonymous User'}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">ID: {customer.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <Mail className="w-3.5 h-3.5 text-primary/40" />
                      {customer.email || 'not provided'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {customer.lastSeenAt ? formatDistanceToNow(customer.lastSeenAt.toDate()) : 'Recently'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-medium">
                    {customer.createdAt ? new Date(customer.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!customers || customers.length === 0) && !isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-sm italic">
                    No customers found yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : customers?.map((customer) => (
          <Card key={customer.id} className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-border/50">
                    <AvatarImage src={`https://picsum.photos/seed/${customer.id}/80/80`} />
                    <AvatarFallback>{customer.name?.[0] || 'C'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{customer.name || 'Anonymous User'}</span>
                    <span className="text-[10px] text-muted-foreground">ID: {customer.id.slice(0, 8)}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                  <Mail className="w-3.5 h-3.5 text-primary/60" />
                  {customer.email || 'not provided'}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-muted">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                  <Clock className="w-3 h-3" />
                  Active {customer.lastSeenAt ? formatDistanceToNow(customer.lastSeenAt.toDate()) : 'Now'}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                  <Calendar className="w-3 h-3" />
                  {customer.createdAt ? new Date(customer.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!customers || customers.length === 0) && !isLoading && (
          <div className="text-center py-12 text-muted-foreground italic text-sm">
            No customers found.
          </div>
        )}
      </div>
    </div>
  )
}
