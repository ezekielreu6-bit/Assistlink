
"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'

export default function LoginPage() {
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupName, setSignupName] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      toast({ title: "Welcome back!", description: "Redirecting to your dashboard." })
      router.push('/dashboard')
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
      await updateProfile(userCredential.user, { displayName: signupName })
      
      toast({ title: "Account created", description: "Welcome to AssistLink!" })
      router.push('/dashboard')
    } catch (error: any) {
      toast({ title: "Sign up Failed", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F0F4] flex flex-col items-center justify-center p-4 sm:p-6">
      <Link href="/" className="mb-6 sm:mb-8 flex items-center gap-2 group">
        <Image src="/logo.png" alt="AssistLink" width={40} height={40} className="rounded-xl shadow-lg transition-transform group-hover:scale-105" />
        <span className="font-bold text-xl sm:text-2xl tracking-tight text-primary">AssistLink</span>
      </Link>

      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 p-1">
            <TabsTrigger value="login" className="rounded-2xl font-semibold">Login</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-2xl font-semibold">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardHeader className="p-6">
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your support dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6 pt-0">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@company.com" 
                    required 
                    className="rounded-xl"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    className="rounded-xl"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6">
                <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Login to Dashboard
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup}>
              <CardHeader className="p-6">
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Get started with AssistLink's intelligent support tools.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6 pt-0">
                <div className="space-y-2">
                  <Label htmlFor="name">Site Name</Label>
                  <Input 
                    id="name" 
                    placeholder="AssistLink" 
                    required 
                    className="rounded-xl"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="name@assistlink.com" 
                    required 
                    className="rounded-xl"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    required 
                    className="rounded-xl"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6">
                <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Free Account
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
      
      <p className="mt-8 text-sm text-muted-foreground text-center">
        Protected by end-to-end encrypted identity verification.<br/>
        
      </p>
    </div>
  )
}
