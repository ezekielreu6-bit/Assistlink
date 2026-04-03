
"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Users, 
  LayoutDashboard,
  LogOut,
  Bell,
  Search,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useUser, useAuth, useFirestore, useMemoFirebase, useDoc } from '@/firebase'
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
  SidebarInset,
  useSidebar
} from '@/components/ui/sidebar'
import { signOut } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()
  const { setOpenMobile, isMobile } = useSidebar()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])

  const userRef = useMemoFirebase(() => user?.email ? doc(db, 'users', user.email) : null, [db, user])
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef)

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
      return
    }

    if (user && user.email && !isProfileLoading && db) {
      if (!userProfile) {
        const orgId = user.email.replace(/\./g, '_')
        
        const setupProfile = async () => {
          // Use displayName from Auth if it exists, otherwise fallback to email part
          const name = user.displayName || user.email!.split('@')[0];
          
          await setDoc(doc(db, 'users', user.email!), {
            id: user.uid,
            email: user.email,
            firstName: name,
            role: 'admin',
            organizationId: orgId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true })
          
          await setDoc(doc(db, 'organizations', orgId), {
            id: orgId,
            name: `${name}'s Team`,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true })
          
          setIsInitializing(false)
        }
        setupProfile()
      } else {
        setIsInitializing(false)
      }
    }
  }, [user, isUserLoading, router, userProfile, isProfileLoading, db])

  const handleSignOut = async () => {
    await signOut(auth)
    router.push('/')
  }

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Chats', icon: MessageSquare, href: '/dashboard/chat' },
    { name: 'Customers', icon: Users, href: '/dashboard/customers' },
    { name: 'Team', icon: Users, href: '/dashboard/team' },
    { name: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { name: 'Subscription', icon: CreditCard, href: '/dashboard/subscription' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ]

  if (isUserLoading || isInitializing || (user && isProfileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Image src="/logo.png" alt="Loading" width={64} height={64} className="rounded-xl shadow-lg" />
          <p className="text-sm font-medium text-muted-foreground">Securing your session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      <Sidebar className="border-r border-border">
        <SidebarHeader className="p-6">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo.png" alt="AssistLink" width={32} height={32} className="rounded-lg group-hover:rotate-12 transition-transform shadow-sm" />
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
            <Button size="sm" className="w-full mt-3 h-8 text-[10px] font-bold tracking-tight rounded-xl" asChild>
              <Link href="/dashboard/subscription">UPGRADE</Link>
            </Button>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 min-w-0">
        <header className="h-16 border-b border-border bg-white flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            <SidebarTrigger className="shrink-0" />
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search chats, customers..." 
                className="pl-10 h-10 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/20 w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground rounded-full h-10 w-10">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-white" />
            </Button>
            <div className="h-8 w-px bg-border mx-1" />
            <div className="flex items-center gap-3 pl-2">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold truncate max-w-[120px]">
                  {userProfile?.firstName || user.displayName || user?.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Support Agent</p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-primary/10 cursor-pointer hover:border-primary transition-colors shadow-sm">
                <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/80/80`} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                  {(userProfile?.firstName?.[0] || user.displayName?.[0] || user?.email?.[0] || 'A').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  )
}
