
"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Zap, Shield, Sparkles, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SubscriptionPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for small teams getting started.',
      features: [
        'Real-time messaging',
        'Up to 100 sessions/mo',
        'Basic AI suggestions',
        'Community support',
        'Powered by AssistLink branding'
      ],
      current: true,
      buttonText: 'Current Plan',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Pro',
      price: '$10',
      interval: '/month',
      description: 'Unleash the full potential of your support team.',
      features: [
        'Unlimited chat sessions',
        'Advanced GenAI smart replies',
        'Remove AssistLink branding',
        'Custom domain support',
        'Priority 24/7 support',
        'Advanced team roles'
      ],
      current: false,
      popular: true,
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'default' as const
    }
  ]

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your plan and billing preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={cn(
              "relative border-none shadow-sm flex flex-col rounded-3xl overflow-hidden transition-all duration-300",
              plan.popular ? "ring-2 ring-primary shadow-xl shadow-primary/10" : "bg-white"
            )}
          >
            {plan.popular && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-white hover:bg-primary font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="p-6 sm:p-8">
              <CardTitle className="text-xl sm:text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-sm mt-2">{plan.description}</CardDescription>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl sm:text-5xl font-extrabold tracking-tight">{plan.price}</span>
                {plan.interval && <span className="text-muted-foreground font-medium">{plan.interval}</span>}
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-0 flex-1">
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">What's included</p>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="p-6 sm:p-8 pt-0">
              <Button 
                variant={plan.buttonVariant} 
                className={cn(
                  "w-full h-12 sm:h-14 rounded-2xl font-bold text-base transition-all",
                  plan.popular ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" : "hover:bg-muted/50"
                )}
                disabled={plan.current}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-primary/5 border border-primary/10">
        <CardContent className="p-6 sm:p-10">
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto sm:mx-0">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold">Instant Activation</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Upgrade and get access to Pro features immediately without any downtime.</p>
            </div>
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto sm:mx-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-bold">Secure Billing</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">We use enterprise-grade encryption for all financial transactions and data.</p>
            </div>
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto sm:mx-0">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-bold">GenAI Optimized</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Pro users get dedicated compute resources for AI-powered suggestions.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
