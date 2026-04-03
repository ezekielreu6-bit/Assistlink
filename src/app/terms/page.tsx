"use client"

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F0F0F4] py-12 sm:py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-[#3333CC] font-bold mb-8 hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-xl shadow-primary/5 border border-white">
          <div className="flex items-center gap-3 mb-8">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          </div>
          <div className="text-muted-foreground leading-relaxed space-y-6">
            <p>Welcome to AssistLink. By using our platform, you agree to the following terms.</p>
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">1. Account Terms</h2>
              <p>You are responsible for maintaining the security of your account and password. AssistLink cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.</p>
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">2. Payment & Subscriptions</h2>
              <p>Free accounts are limited to 5 team members. Pro features are billed monthly via Lemon Squeezy. Usage-based agent replies are billed at $1/hr as reported by our activity tracker.</p>
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">3. Termination</h2>
              <p>We reserve the right to terminate accounts that violate our acceptable use policy or engage in fraudulent activities using our chat infrastructure.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}