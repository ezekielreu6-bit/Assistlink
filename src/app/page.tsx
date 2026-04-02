import React from 'react'
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

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F4]">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#3333CC] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/20">A</div>
            <span className="font-bold text-2xl tracking-tight text-[#3333CC]">AssistLink</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">How it works</Link>
            <Link href="#pricing" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
            <Link href="/dashboard" className="text-sm font-semibold text-primary px-6 py-2 rounded-full border border-primary/20 hover:bg-primary/5 transition-all">Agent Login</Link>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 shadow-xl shadow-primary/20">Get Started Free</Button>
          </nav>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
            <div className="absolute top-24 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-24 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50" />
          </div>

          <div className="container mx-auto px-6 relative">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <Badge variant="outline" className="bg-white border-primary/20 text-primary px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3 h-3 mr-2" />
                AI-Powered Support Platform
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                Modern chat for <span className="text-primary italic">modern</span> teams.
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Connect with your customers instantly. AssistLink provides a beautiful, customizable chat widget with AI-driven agent suggestions to boost productivity.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full h-14 px-10 text-lg shadow-2xl shadow-primary/30 group">
                  Start for free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="bg-white/50 backdrop-blur rounded-full h-14 px-10 text-lg border-border hover:bg-white">
                  Watch demo
                </Button>
              </div>
              
              {/* Product Preview */}
              <div className="mt-20 relative p-4 rounded-[2.5rem] bg-white shadow-2xl shadow-primary/10 border border-white max-w-5xl mx-auto overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <Image 
                  src="https://picsum.photos/seed/hero-dashboard/1200/800"
                  alt="AssistLink Dashboard"
                  width={1200}
                  height={800}
                  className="rounded-[2rem] border border-border shadow-inner"
                  data-ai-hint="software dashboard"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Everything you need to support better.</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We've built the essential tools for customer success, powered by the latest AI technologies.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <div key={f.title} className="p-10 rounded-[2rem] bg-[#F0F0F4]/30 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/10 group">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", f.bg)}>
                    <f.icon className={cn("w-7 h-7", f.color)} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="bg-[#3333CC] rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/40">
              <div className="absolute top-[-50px] left-[-50px] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
              
              <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to delight your customers?</h2>
                <p className="text-xl text-white/80 leading-relaxed">
                  Join 2,000+ businesses using AssistLink to provide world-class support. No credit card required.
                </p>
                <div className="pt-6">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full h-16 px-12 text-xl font-bold shadow-xl">
                    Get Started Free
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-8 pt-8 text-sm text-white/60">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Forever free tier</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> 2-minute setup</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> No hidden fees</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-20 border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">A</div>
                <span className="font-bold text-xl tracking-tight text-primary">AssistLink</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Empowering teams to provide human-centric support through intelligent automation and beautiful design.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Chat Widget</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Agent Dashboard</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Status</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact Sales</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-muted-foreground">© 2024 AssistLink Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><X className="w-5 h-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><MessageSquare className="w-5 h-5" /></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
