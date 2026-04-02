"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Users, 
  LayoutDashboard,
  LogOut,
  Bell,
  Search,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Chats', icon: MessageSquare, href: '/dashboard/chat' },
    { name: 'Customers', icon: Users, href: '/dashboard/customers' },
    { name: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform">A</div>
              <span className="font-bold text-xl text-foreground">AssistLink</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-3">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-6 rounded-xl transition-all duration-200",
                      pathname === item.href 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 mt-auto">
            <div className="bg-primary/5 rounded-2xl p-4 mb-4 border border-primary/10">
              <p className="text-xs font-semibold text-primary mb-1">Upgrade to Pro</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Remove branding and get advanced AI features.</p>
              <Button size="sm" className="w-full mt-3 h-8 text-[10px] font-bold tracking-tight">UPGRADE</Button>
            </div>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1">
          <header className="h-16 border-b border-border bg-white flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="md:hidden" />
              <div className="relative w-full max-w-md hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search chats, customers..." 
                  className="pl-10 h-10 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/20"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground rounded-full h-10 w-10">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-white" />
              </Button>
              <div className="h-8 w-px bg-border mx-1" />
              <div className="flex items-center gap-3 pl-2">
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-semibold">Alex Carter</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Senior Agent</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-primary/10 cursor-pointer hover:border-primary transition-colors">
                  <AvatarImage src="https://picsum.photos/seed/agent-alex/80/80" />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
