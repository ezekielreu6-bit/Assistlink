"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Zap, Shield, Sparkles, Users, UserCheck, EyeOff, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/firebase'

export default function SubscriptionPage() {
  const { user } = useUser()
  const orgId = user?.email ? user.email.replace(/\./g, '_') : ''

  // Replace these with your actual Lemon Squeezy Variant IDs
  const VARIANTS = {
    PRO_MONTHLY: '12345', 
    AGENT_ADDON: '67890',
    EXTRA_SEATS: '11223',
    WHITELABEL: '44556'
  }

  const handleCheckout = (variantId: string) => {
    if (!orgId) return
    // Redirect to Lemon Squeezy with custom orgId for the webhook
    const checkoutUrl = `https://assistlink.lemonsqueezy.com/checkout/buy/${variantId}?checkout[custom][orgId]=${orgId}&checkout[email]=${user?.email}`
    window.open(checkoutUrl, '_blank')
  }

  const plans = [
    {
      name: 'Starter',
      price: '$0',
      description: 'Perfect for individuals and small startups.',
      features: [
        'Up to 5 team members',
        '100 AI-powered replies/mo',
        'Basic widget customization',
        'AssistLink branding included',
        'Standard support'
      ],
      current: true,
      buttonText: 'Current Plan',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Pro Business',
      price: '$19',
      variantId: VARIANTS.PRO_MONTHLY,
      interval: '/month',
      description: 'Scale your customer support with full control.',
      features: [
        'Up to 15 team members',
        'Unlimited AI smart replies',
        'Remove AssistLink branding',
        'Advanced visual styling',
        'Custom domain mapping',
        'Priority email support'
      ],
      current: false,
      popular: true,
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'default' as const
    }
  ]

  return (
    <div className="space-y-10 sm:space-y-12 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto px-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Simple, Scalable Pricing
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose the plan that fits your team. All plans include our core real-time messaging engine.
        </p>
      </div>

      {/* Main Plans */}
      <div className="grid gap-8 md:grid-cols-2 lg:max-w-4xl lg:mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={cn(
              "relative border-none shadow-sm flex flex-col rounded-[2.5rem] overflow-hidden transition-all duration-300",
              plan.popular ? "ring-2 ring-primary shadow-2xl shadow-primary/20 bg-white" : "bg-muted/30"
            )}
          >
            {plan.popular && (
              <div className="absolute top-6 right-6">
                <Badge className="bg-primary text-white font-bold px-4 py-1 rounded-full text-[10px] uppercase tracking-widest">
                  Best Value
                </Badge>
              </div>
            )}
            <CardHeader className="p-8 sm:p-10">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-base mt-2">{plan.description}</CardDescription>
              <div className="mt-8 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold tracking-tighter">{plan.price}</span>
                {plan.interval && <span className="text-muted-foreground text-lg font-medium">{plan.interval}</span>}
              </div>
            </CardHeader>
            <CardContent className="p-8 sm:p-10 pt-0 flex-1">
              <div className="space-y-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Core Features</p>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm font-medium">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="p-8 sm:p-10 pt-0">
              <Button 
                onClick={() => plan.variantId && handleCheckout(plan.variantId)}
                variant={plan.buttonVariant} 
                className={cn(
                  "w-full h-14 rounded-2xl font-bold text-lg transition-all active:scale-95",
                  plan.popular ? "bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary/90" : "bg-white"
                )}
                disabled={plan.current}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Usage Based Add-ons Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">On-Demand Add-ons</h3>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Agent Add-on */}
          <Card className="border-none shadow-sm rounded-3xl bg-white p-6 flex flex-col justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Human Agents</h4>
                <p className="text-xs text-muted-foreground">Metered billing: <span className="text-foreground font-bold">$1/hr</span></p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl w-full" onClick={() => handleCheckout(VARIANTS.AGENT_ADDON)}>
              Enable Metering
            </Button>
          </Card>

          {/* Extra Seats */}
          <Card className="border-none shadow-sm rounded-3xl bg-white p-6 flex flex-col justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Extra Seats</h4>
                <p className="text-xs text-muted-foreground">Add 10 members for <span className="text-foreground font-bold">$5/mo</span></p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl w-full" onClick={() => handleCheckout(VARIANTS.EXTRA_SEATS)}>
              Add Seats
            </Button>
          </Card>

          {/* White Label */}
          <Card className="border-none shadow-sm rounded-3xl bg-white p-6 flex flex-col justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                <EyeOff className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm">White-label</h4>
                <p className="text-xs text-muted-foreground">Remove branding for <span className="text-foreground font-bold">$10/mo</span></p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl w-full" onClick={() => handleCheckout(VARIANTS.WHITELABEL)}>
              Remove Branding
            </Button>
          </Card>
        </div>
      </div>

      {/* Trust Section */}
      <div className="grid sm:grid-cols-3 gap-8 pt-10 border-t border-muted">
        <div className="flex gap-4">
          <Shield className="w-10 h-10 text-primary/40 shrink-0" />
          <div>
            <h5 className="font-bold text-sm">Secure Payments</h5>
            <p className="text-xs text-muted-foreground">Global processing via Lemon Squeezy.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Zap className="w-10 h-10 text-primary/40 shrink-0" />
          <div>
            <h5 className="font-bold text-sm">Instant Access</h5>
            <p className="text-xs text-muted-foreground">Features are unlocked immediately after checkout.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <ExternalLink className="w-10 h-10 text-primary/40 shrink-0" />
          <div>
            <h5 className="font-bold text-sm">Manage Billing</h5>
            <p className="text-xs text-muted-foreground">Update cards or cancel via your customer portal.</p>
          </div>
        </div>
      </div>
    </div>
  )
}