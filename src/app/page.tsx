"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  Palette, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F4]">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="AssistLink Logo" width={32} height={32} className="rounded-lg shadow-lg shadow-primary/20 sm:w-10 sm:h-10" />
            <span className="font-bold text-lg sm:text-2xl tracking-tight text-[#3333CC]">AssistLink</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                {link.name}
              </Link>
            ))}
            <Button variant="ghost" className="text-sm font-semibold text-primary px-4 py-2 rounded-full border border-primary/20 hover:bg-primary/5 transition-all" asChild>
              <Link href="/login">Agent Login</Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-xl shadow-primary/20" asChild>
              <Link href="/login">Get Started Free</Link>
            </Button>
          </nav>

          {/* Mobile Nav Trigger */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2">
                  <Image src="/logo.png" alt="AssistLink" width={24} height={24} />
                  AssistLink
                </SheetTitle>
                <SheetDescription>
                  Customer communication platform.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-6 mt-12">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    className="text-lg font-semibold hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-4 mt-4">
                  <Button variant="outline" className="w-full rounded-full" asChild>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>Agent Login</Link>
                  </Button>
                  <Button className="w-full rounded-full bg-primary" asChild>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>Get Started Free</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 pt-16 sm:pt-20">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-32 overflow-hidden px-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
            <div className="absolute top-12 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-12 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl opacity-50" />
          </div>

          <div className="container mx-auto relative">
            <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
              <div className="flex justify-center">
                <Badge variant="outline" className="bg-white border-primary/20 text-primary px-3 py-1 sm:px-4 sm:py-1.5 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-sm">
                  ✨ New: AI Smart Suggestions are here
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.2] sm:leading-[1.1]">
                Modern chat for <span className="text-primary italic">modern</span> teams.
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Connect with your customers instantly. AssistLink provides a beautiful, customizable chat widget with AI-driven agent suggestions to boost productivity.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-full h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg shadow-2xl shadow-primary/30 group" asChild>
                  <Link href="/login">
                    Start for free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/50 backdrop-blur rounded-full h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg border-border hover:bg-white">
                  Watch demo
                </Button>
              </div>

              {/* Product Preview */}
              <div className="mt-12 sm:mt-20 relative p-2 sm:p-4 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white shadow-2xl shadow-primary/10 border border-white max-w-5xl mx-auto overflow-hidden">
                <Image 
                  src="https://ik.imagekit.io/Homa/InShot_20260403_151340794.jpg"
                  alt="AssistLink Dashboard"
                  width={1200}
                  height={800}
                  className="rounded-[1.2rem] sm:rounded-[2rem] border border-border shadow-inner"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 sm:py-24 bg-white px-4">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 tracking-tight">Everything you need to support better.</h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                We&apos;ve built the essential tools for customer success, powered by the latest AI technologies.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                { 
                  title: 'Real-time Messaging', 
                  desc: 'Blazing fast communication between customers and agents with typing indicators.', 
                  icon: Zap,
                  color: 'text-yellow-500',
                  bg: 'bg-yellow-50'
                },
                { 
                  title: 'AI Smart Replies', 
                  desc: 'Suggest relevant responses to agents based on the conversation context.', 
                  icon: Sparkles,
                  color: 'text-primary',
                  bg: 'bg-primary/10'
                },
                { 
                  title: 'Visual Customization', 
                  desc: 'Use AI to extract brand colors from your website or pick them manually.', 
                  icon: Palette,
                  color: 'text-accent',
                  bg: 'bg-accent/10'
                },
                { 
                  title: 'Customer Analytics', 
                  desc: 'Track metrics like response time, satisfaction, and active chat volume.', 
                  icon: BarChart3,
                  color: 'text-purple-600',
                  bg: 'bg-purple-50'
                },
                { 
                  title: 'Multi-platform', 
                  desc: 'Embed on any site with a single line of code. Support for React, HTML, and more.', 
                  icon: Layers,
                  color: 'text-green-600',
                  bg: 'bg-green-50'
                },
                { 
                  title: 'Secure & Reliable', 
                  desc: 'Enterprise-grade encryption for all your customer conversations and data.', 
                  icon: ShieldCheck,
                  color: 'text-red-500',
                  bg: 'bg-red-50'
                }
              ].map((f) => (
                <div key={f.title} className="p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2rem] bg-[#F0F0F4]/30 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/10 group text-center sm:text-left">
                  <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform mx-auto sm:mx-0", f.bg)}>
                    <f.icon className={cn("w-6 h-6 sm:w-7 sm:h-7", f.color)} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{f.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 px-4">
          <div className="container mx-auto">
            <div className="bg-[#3333CC] rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/40">
              <div className="absolute top-[-50px] left-[-50px] w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 sm:w-96 sm:h-96 bg-accent/20 rounded-full blur-3xl" />

              <div className="relative z-10 max-w-3xl mx-auto space-y-6 sm:space-y-8">
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight">Ready to delight your customers?</h2>
                <p className="text-base sm:text-xl text-white/80 leading-relaxed">
                  Join 2,000+ businesses using AssistLink to provide world-class support. No credit card required.
                </p>
                <div className="pt-4 sm:pt-6">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 rounded-full h-12 sm:h-16 px-8 sm:px-12 text-lg sm:text-xl font-bold shadow-xl" asChild>
                    <Link href="/login">Get Started Free</Link>
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-6 sm:pt-8 text-xs sm:text-sm text-white/60">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Forever free tier</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> 2-minute setup</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> No hidden fees</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 sm:py-20 border-t border-border/50 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
            <div className="col-span-2 md:col-span-1 space-y-4 sm:space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="AssistLink" width={24} height={24} />
                <span className="font-bold text-lg sm:text-xl tracking-tight text-primary">AssistLink</span>
              </Link>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Empowering teams to provide human-centric support through intelligent automation and beautiful design.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base mb-4 sm:mb-6">Product</h4>
              <ul className="space-y-2 sm:space-y-4 text-xs sm:text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Chat Widget</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Agent Dashboard</Link></li>
                <li><Link href="/dashboard/settings" className="hover:text-primary transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base mb-4 sm:mb-6">Company</h4>
              <ul className="space-y-2 sm:space-y-4 text-xs sm:text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 sm:pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] sm:text-xs text-muted-foreground">© 2026 AssistLink Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}