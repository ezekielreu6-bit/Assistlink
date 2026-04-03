"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ChatPreview } from '@/components/chat-preview'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Wand2, Copy, Check, Loader2, Palette, Terminal, Globe, Link as LinkIcon, Save, Building2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { extractWebsiteColors } from '@/ai/flows/website-color-extractor-flow'
import { useUser, db } from '@/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

export default function SettingsPage() {
  const { user } = useUser()
  const { toast } = useToast()
  
  // State
  const [primaryColor, setPrimaryColor] = useState('#3333CC')
  const [accentColor, setAccentColor] = useState('#1FBAF5')
  const [companyName, setCompanyName] = useState('AssistLink') // Default
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('Hi! How can we help you today?')
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const orgId = user?.email ? user.email.replace(/\./g, '_') : null
  const endpointUrl = `https://assistlink-bit.vercel.app/api/widget?id=${orgId}`

  // 1. Load User Profile (for Name) and Widget Settings
  useEffect(() => {
    async function loadData() {
      if (!user?.email || !orgId || !db) return
      
      try {
        // Fetch User Profile to get the name they signed up with
        const userRef = doc(db, 'users', user.email)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          const userData = userSnap.data()
          // Use firstName or companyName from signup
          const signupName = userData.firstName || userData.companyName || 'AssistLink'
          setCompanyName(signupName)
        }

        // Fetch Widget Configuration
        const configRef = doc(db, 'organizations', orgId, 'chatWidgetConfigurations', 'default')
        const configSnap = await getDoc(configRef)
        
        if (configSnap.exists()) {
          const data = configSnap.data()
          setPrimaryColor(data.primaryColor || '#3333CC')
          setAccentColor(data.accentColor || '#1FBAF5')
          setWelcomeMessage(data.welcomeMessage || 'Hi! How can we help you today?')
          setWebsiteUrl(data.websiteUrl || '')
          // If they saved a custom display name, override the signup name
          if (data.companyName) setCompanyName(data.companyName)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
    loadData()
  }, [user, orgId])

  // 2. Save Settings
  const handleSaveSettings = async () => {
    if (!orgId || !db) return
    setIsSaving(true)
    try {
      const docRef = doc(db, 'organizations', orgId, 'chatWidgetConfigurations', 'default')
      await setDoc(docRef, {
        primaryColor,
        accentColor,
        companyName,
        welcomeMessage,
        websiteUrl,
        updatedAt: serverTimestamp(),
        orgId: orgId
      }, { merge: true })

      toast({ title: "Settings Saved", description: "Your widget has been updated." })
    } catch (error) {
      toast({ title: "Save Failed", description: "Could not save settings.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAiExtract = async () => {
    if (!websiteUrl) {
      toast({ title: "URL Required", description: "Please enter a website URL first.", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`https://picsum.photos/seed/${encodeURIComponent(websiteUrl)}/1200/800`);
      const blob = await response.blob();
      const reader = new FileReader();
      const dataUri = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const result = await extractWebsiteColors({ screenshotDataUri: dataUri, websiteUrl });

      if (result.colors && result.colors.length >= 2) {
        setPrimaryColor(result.colors[0]);
        setAccentColor(result.colors[1]);
        toast({ title: "Colors Extracted", description: "AI updated your theme." })
      }
    } catch (error) {
      toast({ title: "Extraction Failed", description: "Could not analyze website.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const embedCode = `<!-- AssistLink Widget Installation -->
<script src="${endpointUrl}"></script>
<script>
  AssistLink.init({
    orgId: "${orgId}",
    primaryColor: "${primaryColor}",
    accentColor: "${accentColor}"
  });
</script>`

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500 pb-12 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Widget Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your widget endpoint and visual styling.</p>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 bg-primary h-11 px-8"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
          <Tabs defaultValue="design" className="w-full">
            <ScrollArea className="w-full">
              <TabsList className="bg-muted/50 p-1 rounded-xl mb-4 inline-flex min-w-full sm:min-w-0">
                <TabsTrigger value="design" className="rounded-lg px-6 flex-1">
                  <Palette className="w-4 h-4 mr-2" />
                  Design
                </TabsTrigger>
                <TabsTrigger value="installation" className="rounded-lg px-6 flex-1">
                  <Terminal className="w-4 h-4 mr-2" />
                  Installation
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <TabsContent value="design" className="space-y-6">
              {/* Appearance Card */}
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Appearance</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-6">
                  {/* Company Name Input */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Display Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your Company Name" 
                        className="pl-10 h-12 rounded-xl"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">This name appears at the top of the chat window.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Primary Color</Label>
                      <div className="flex gap-3">
                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-none" />
                        <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono rounded-xl h-12" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Accent Color</Label>
                      <div className="flex gap-3">
                        <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-none" />
                        <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="font-mono rounded-xl h-12" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="text-sm font-semibold">Welcome Message</Label>
                    <Textarea 
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      className="rounded-2xl min-h-[100px] bg-muted/20 border-none p-4"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* AI Extraction Card */}
              <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="bg-primary/5 border-b border-primary/10 p-4 sm:p-6">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base sm:text-lg">AI Smart Theme</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="relative w-full">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="https://yourbrand.com" 
                      className="pl-10 h-12 rounded-xl bg-muted/20 border-none"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAiExtract} disabled={loading} className="w-full h-12 rounded-xl bg-primary">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    {loading ? "Analyzing..." : "Extract Colors from Website"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="installation" className="space-y-6">
               {/* ... Keep your existing Installation Card code here ... */}
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Sticky Column */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 order-1 lg:order-2">
          <div className="p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white border border-border/50 shadow-xl shadow-primary/5">
            <p className="text-[10px] font-bold text-center uppercase tracking-[0.2em] text-muted-foreground mb-4">Live Preview</p>
            <div className="flex justify-center scale-[0.85] sm:scale-100 origin-top">
              <ChatPreview 
                primaryColor={primaryColor} 
                accentColor={accentColor}
                companyName={companyName}
                welcomeMessage={welcomeMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}