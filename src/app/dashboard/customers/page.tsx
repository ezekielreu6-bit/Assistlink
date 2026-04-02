
"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MoreHorizontal, UserPlus, Filter } from 'lucide-react'
import { mockChats } from '@/lib/mock-data'

export default function CustomersPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage and view all customer interactions.</p>
        </div>
        <Button className="rounded-xl gap-2">
          <UserPlus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search customers..." className="pl-10 h-11 rounded-xl bg-white border-none shadow-sm" />
        </div>
        <Button variant="outline" className="rounded-xl gap-2 h-11 bg-white">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="rounded-tl-xl px-6">Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Chats</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead className="rounded-tr-xl text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockChats.map((customer) => (
                <TableRow key={customer.id} className="group hover:bg-muted/10 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback>{customer.customerName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{customer.customerName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {customer.customerName.toLowerCase().replace(' ', '.')}@example.com
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.status === 'active' ? 'default' : 'secondary'} className="rounded-full capitalize">
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">12</TableCell>
                  <TableCell className="text-muted-foreground">{customer.time}</TableCell>
                  <TableCell className="text-right px-6">
                    <Button variant="ghost" size="icon" className="rounded-full">
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
