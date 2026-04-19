"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Wand2, Copy, Loader2, Save, Building2, Globe, Hash } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { ChatPreview } from '@/components/chat-preview'

const COMMON_COLORS = [
  '#3333CC', '#1FBAF5', '#7C3AED', '#F43F5E', '#10B981',
  '#F59E0B', '#6366F1', '#000000', '#4B5563', '#2563EB'
]

export default function SettingsPage() {
  const { user } = useUser()
  const { toast } = useToast()

  const [primaryColor, setPrimaryColor] = useState('#3333CC')
  const [accentColor, setAccentColor] = useState('#1FBAF5')
  const [companyName, setCompanyName] = useState('Support')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('Hi! How can we help you today?')
  const [showBranding, setShowBranding] = useState(true)

  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeField, setActiveField] = useState<'primary' | 'accent' | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)

  const [orgId, setOrgId] = useState<string | null>(null)

  // Fetch orgId and settings
  useEffect(() => {
    async function fetchOrgAndSettings() {
      if (!user?.email || !db) {
        setIsPageLoading(false)
        return
      }

      try {
        const userEmail = user.email.toLowerCase().trim()
        const userDocRef = doc(db, 'users', userEmail)
        const userSnap = await getDoc(userDocRef)

        let currentOrgId = userEmail.replace(/\./g, '_')

        if (userSnap.exists()) {
          const userData = userSnap.data()
          if (userData.organizationId) {
            currentOrgId = userData.organizationId
          }
        }

        setOrgId(currentOrgId)

        // Load widget settings
        const configRef = doc(db, 'organizations', currentOrgId, 'chatWidgetConfigurations', 'default')
        const configSnap = await getDoc(configRef)

        if (configSnap.exists()) {
          const data = configSnap.data()
          setPrimaryColor(data.primaryColor || '#3333CC')
          setAccentColor(data.accentColor || '#1FBAF5')
          setCompanyName(data.companyName || 'Support')
          setWelcomeMessage(data.welcomeMessage || 'Hi! How can we help you today?')
          setWebsiteUrl(data.websiteUrl || '')
        }

        // Load plan for branding
        const orgRef = doc(db, 'organizations', currentOrgId)
        const orgSnap = await getDoc(orgRef)
        if (orgSnap.exists()) {
          setShowBranding(orgSnap.data().plan !== 'pro')
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
      } finally {
        setIsPageLoading(false)
      }
    }

    fetchOrgAndSettings()
  }, [user])

  // Clean short embed code (exactly what you wanted)
  const embedCode = orgId 
    ? `<!-- AssistLink Chat Widget -->
<script src="https://assistlink-bit.vercel.app/api/widget?id=${orgId}"></script>
<script>
  AssistLink.init({
    orgId: "${orgId}",
    primaryColor: "${primaryColor}",
    accentColor: "${accentColor}"
  });
</script>`
    : '<!-- Save your settings first to generate the embed code -->'

  const handleSave = async () => {
    if (!orgId || !db) {
      toast({ title: "Error", description: "Please sign in again.", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const configRef = doc(db, 'organizations', orgId, 'chatWidgetConfigurations', 'default')
      await setDoc(configRef, {
        primaryColor,
        accentColor,
        companyName: companyName.trim(),
        welcomeMessage: welcomeMessage.trim(),
        websiteUrl: websiteUrl.trim(),
        updatedAt: serverTimestamp(),
      }, { merge: true })

      toast({
        title: "✓ Settings Saved",
        description: "Your chat widget has been updated."
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Save Failed",
        description: "Please check your connection and try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExtractColors = async () => {
    if (!websiteUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter your website URL first.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/extract-colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: websiteUrl.trim() }),
      })

      if (!res.ok) throw new Error('Failed')

      const result = await res.json()

      if (result.primaryColor && result.accentColor) {
        setPrimaryColor(result.primaryColor)
        setAccentColor(result.accentColor)
        toast({
          title: "Brand Colors Detected",
          description: `Primary: ${result.primaryColor} • Accent: ${result.accentColor}`,
        })
      }
    } catch (error) {
      toast({
        title: "Extraction Failed",
        description: "Could not analyze your website. Try again or pick manually.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getColorSuggestions = (value: string) => {
    if (!value) return COMMON_COLORS
    return COMMON_COLORS.filter(c => c.toLowerCase().includes(value.toLowerCase()))
  }

  const ColorPicker = ({ label, value, onChange, field }: {
    label: string
    value: string
    onChange: (color: string) => void
    field: 'primary' | 'accent'
  }) => (
    <div className="space-y-2">
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="flex gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm cursor-pointer"
        />
        <div className="relative flex-1">
          <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            onFocus={() => setActiveField(field)}
            className="pl-10 h-14 rounded-2xl font-mono text-sm"
          />

          {activeField === field && (
            <Card className="absolute z-50 w-full mt-2 shadow-xl border-none rounded-2xl overflow-hidden">
              <ScrollArea className="max-h-52">
                {getColorSuggestions(value).map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onChange(color)
                      setActiveField(null)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted text-sm font-mono transition-colors"
                  >
                    <div
                      className="w-6 h-6 rounded-lg border border-white/50 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    {color}
                  </button>
                ))}
              </ScrollArea>
            </Card>
          )}
        </div>
      </div>
    </div>
  )

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#3333CC]" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Widget Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground">Customize appearance and install on your site</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="rounded-2xl h-12 px-8 bg-[#3333CC] hover:bg-[#2a2aa3] shadow-lg w-full sm:w-auto"
        >
          {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-7 space-y-6">
          <Tabs defaultValue="design" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/60 p-1 rounded-2xl h-12">
              <TabsTrigger value="design" className="rounded-xl py-3 text-sm">Design</TabsTrigger>
              <TabsTrigger value="installation" className="rounded-xl py-3 text-sm">Installation</TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-6 mt-6">
              <Card className="border-none shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how your widget looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-2">
                  <div className="space-y-2">
                    <Label>Company / Display Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-11 h-12 rounded-2xl"
                        placeholder="Your Company"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ColorPicker label="Primary Color" value={primaryColor} onChange={setPrimaryColor} field="primary" />
                    <ColorPicker label="Accent Color" value={accentColor} onChange={setAccentColor} field="accent" />
                  </div>

                  <div className="space-y-2">
                    <Label>Welcome Message</Label>
                    <Textarea
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      className="min-h-[110px] rounded-2xl resize-y"
                      placeholder="Hi! How can we help you today?"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-[#3333CC]" />
                    AI Brand Sync
                  </CardTitle>
                  <CardDescription>Let AI automatically pull your brand colors from your website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="https://yourwebsite.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="pl-11 h-12 rounded-2xl"
                    />
                  </div>
                  <Button 
                    onClick={handleExtractColors} 
                    disabled={loading || !websiteUrl.trim()}
                    className="w-full h-12 rounded-2xl bg-[#3333CC] hover:bg-[#2a2aa3]"
                  >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                    Extract Brand Colors
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="installation" className="mt-6">
              <Card className="border-none shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle>Embed Code</CardTitle>
                  <CardDescription>
                    Paste this before the closing <code>&lt;/body&gt;</code> tag
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="bg-zinc-950 text-zinc-100 p-5 rounded-2xl overflow-x-auto text-sm font-mono leading-relaxed whitespace-pre-wrap">
                    {embedCode}
                  </pre>

                  <Button 
                    onClick={() => {
                      if (!orgId) {
                        toast({ title: "Save settings first" })
                        return
                      }
                      navigator.clipboard.writeText(embedCode)
                      toast({ title: "✅ Copied to clipboard" })
                    }}
                    className="w-full h-12 rounded-2xl"
                    variant="outline"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Embed Code
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-5">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Live Preview</CardTitle>
                <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Real-time</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8 flex justify-center bg-zinc-50 min-h-[460px] md:min-h-[620px]">
              <div className="scale-[0.75] sm:scale-[0.82] md:scale-90 lg:scale-100 origin-top">
                <ChatPreview
                  primaryColor={primaryColor}
                  accentColor={accentColor}
                  companyName={companyName || 'Support'}
                  welcomeMessage={welcomeMessage}
                  showBranding={showBranding}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}