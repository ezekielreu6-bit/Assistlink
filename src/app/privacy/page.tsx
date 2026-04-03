"use client"

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F0F0F4] py-12 sm:py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-[#3333CC] font-bold mb-8 hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-xl shadow-primary/5 border border-white">
          <div className="flex items-center gap-3 mb-8">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          </div>
          <div className="text-muted-foreground leading-relaxed space-y-6">
            <p>Last updated: April 2026</p>
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">1. Data Collection</h2>
              <p>We collect information you provide directly to us when you create an account, use our chat widget, or communicate with us. This includes your email address, organization details, and chat logs required to provide support services.</p>
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">2. Use of Information</h2>
              <p>We use the information to provide, maintain, and improve our services, including training our AI models to provide better smart suggestions for your support agents.</p>
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">3. Data Security</h2>
              <p>We implement enterprise-grade encryption to protect your customer conversations and organizational data. We do not sell your personal data to third parties.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}