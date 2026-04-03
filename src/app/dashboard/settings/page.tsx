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
  const [companyName, setCompanyName] = useState('Support')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('Hi! How can we help you today?')
  const [showBranding, setShowBranding] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const orgId = user?.email ? user.email.replace(/\./g, '_') : null
  const endpointUrl = `https://assistlink-bit.vercel.app/api/widget?id=${orgId}`

  // 1. Load Data
  useEffect(() => {
    async function loadData() {
      if (!orgId || !db) return

      try {
        const configRef = doc(db, 'organizations', orgId, 'chatWidgetConfigurations', 'default')
        const configSnap = await getDoc(configRef)

        if (configSnap.exists()) {
          const data = configSnap.data()
          setPrimaryColor(data.primaryColor || '#3333CC')
          setAccentColor(data.accentColor || '#1FBAF5')
          setWelcomeMessage(data.welcomeMessage || 'Hi! How can we help you today?')
          setWebsiteUrl(data.websiteUrl || '')
          setCompanyName(data.companyName || 'Support')
          setShowBranding(data.plan !== 'pro')
        }
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
    loadData()
  }, [orgId])

  // 2. Save Settings
  const handleSaveSettings = async () => {
    if (!orgId || !db) {
        toast({ title: "Error", description: "You must be logged in to save settings.", variant: "destructive" })
        return
    }
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

      toast({ title: "Settings Saved", description: "Your widget has been updated successfully." })
    } catch (error) {
      console.error("Save Error:", error)
      toast({ title: "Save Failed", description: "Check your internet or permissions.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  // 3. AI Extraction
  const handleAiExtract = async () => {
    if (!websiteUrl) {
      toast({ title: "URL Required", description: "Please enter a website URL first.", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const result = await extractWebsiteColors({ 
        screenshotDataUri: `https://picsum.photos/seed/${encodeURIComponent(websiteUrl)}/1200/800`, 
        websiteUrl 
      });

      if (result.colors && result.colors.length >= 2) {
        setPrimaryColor(result.colors[0]);
        setAccentColor(result.colors[1]);
        toast({ title: "Colors Extracted" })
      }
    } catch (error) {
      toast({ title: "Extraction Failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // 4. The JavaScript Code for the user
  const embedCode = `<!-- AssistLink Widget -->
<script src="${endpointUrl}"></script>
<script>
  AssistLink.init({
    orgId: "${orgId}",
    primaryColor: "${primaryColor}",
    accentColor: "${accentColor}"
  });
</script>`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: "Copied to clipboard" })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500 pb-12 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Widget Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your chat appearance and installation.</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full sm:w-auto rounded-xl px-8 bg-primary h-11 shadow-lg shadow-primary/20">
          {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <Tabs defaultValue="design" className="w-full">
            <TabsList className="bg-muted/50 p-1 rounded-xl mb-4 w-full sm:w-auto">
              <TabsTrigger value="design" className="rounded-lg px-6 flex-1">Design</TabsTrigger>
              <TabsTrigger value="installation" className="rounded-lg px-6 flex-1">Installation</TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-6">
              <Card className="border-none shadow-sm rounded-2xl">
                <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="rounded-xl h-12" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded-lg border-none cursor-pointer" />
                        <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <div className="flex gap-2">
                        <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-12 h-12 rounded-lg border-none cursor-pointer" />
                        <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Welcome Message</Label>
                    <Textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} className="rounded-xl min-h-[100px]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl bg-primary/5">
                <CardHeader><CardTitle className="flex items-center gap-2 text-primary"><Wand2 className="w-5 h-5"/> AI Color Extractor</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="https://yourwebsite.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="h-12 rounded-xl bg-white" />
                  <Button onClick={handleAiExtract} disabled={loading} className="w-full h-12 rounded-xl">
                    {loading ? <Loader2 className="animate-spin mr-2" /> : "Sync Brand Colors"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="installation" className="space-y-6">
              <Card className="border-none shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle>Embed Code</CardTitle>
                  <CardDescription>Copy this code into your website's HTML before the &lt;/body&gt; tag.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <pre className="p-4 bg-slate-950 text-slate-50 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed">
                      {embedCode}
                    </pre>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="absolute top-2 right-2 rounded-lg"
                      onClick={() => copyToClipboard(embedCode)}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl">
                <CardHeader><CardTitle>Direct Endpoint</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input readOnly value={endpointUrl} className="bg-muted font-mono text-xs" />
                    <Button variant="outline" onClick={() => copyToClipboard(endpointUrl)}><Copy className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="p-6 rounded-[2rem] bg-white border shadow-xl flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Live Preview</span>
            <div className="scale-90 sm:scale-100 origin-top">
              <ChatPreview 
                primaryColor={primaryColor} 
                accentColor={accentColor}
                companyName={companyName}
                welcomeMessage={welcomeMessage}
                showBranding={showBranding}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}