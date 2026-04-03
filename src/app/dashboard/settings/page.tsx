"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ChatPreview } from '@/components/chat-preview'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Wand2, Copy, Check, Loader2, Palette, Terminal, Globe, Link as LinkIcon, Save, Building2, Hash } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { extractWebsiteColors } from '@/ai/flows/website-color-extractor-flow'
import { useUser, db } from '@/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

// Predefined Brand Colors for Suggestions
const COMMON_COLORS = [
  '#3333CC', '#1FBAF5', '#7C3AED', '#F43F5E', '#10B981', 
  '#F59E0B', '#6366F1', '#000000', '#4B5563', '#2563EB'
]

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

  // Suggestion State
  const [activeField, setActiveField] = useState<'primary' | 'accent' | null>(null)

  const orgId = user?.email ? user.email.replace(/\./g, '_') : null
  const endpointUrl = `https://assistlink-bit.vercel.app/api/widget?id=${orgId}`

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
      } catch (error) { console.error(error) }
    }
    loadData()
  }, [orgId])

  const handleSaveSettings = async () => {
    if (!orgId || !db) return
    setIsSaving(true)
    try {
      await setDoc(doc(db, 'organizations', orgId, 'chatWidgetConfigurations', 'default'), {
        primaryColor, accentColor, companyName, welcomeMessage, websiteUrl,
        updatedAt: serverTimestamp(), orgId
      }, { merge: true })
      toast({ title: "Settings Saved" })
    } catch (error) { toast({ title: "Save Failed", variant: "destructive" }) }
    finally { setIsSaving(false) }
  }

  // Helper to filter colors based on input
  const getFilteredColors = (input: string) => {
    return COMMON_COLORS.filter(c => c.toLowerCase().startsWith(input.toLowerCase()))
  }

  // Custom Color Input Component with Dropdown
  const ColorInput = ({ label, value, onChange, field }: any) => (
    <div className="space-y-2 relative">
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <div className="relative shrink-0">
          <input 
            type="color" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="w-12 h-12 rounded-xl border-none cursor-pointer p-0 overflow-hidden" 
          />
        </div>
        <div className="relative flex-1">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setActiveField(field)}
            onBlur={() => setTimeout(() => setActiveField(null), 200)} // Delay to allow click
            className="pl-9 h-12 rounded-xl font-mono"
          />
          
          {/* Suggestion Dropdown */}
          {activeField === field && getFilteredColors(value).length > 0 && (
            <Card className="absolute z-50 w-full mt-2 p-1 shadow-2xl border-none rounded-xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <ScrollArea className="h-40">
                {getFilteredColors(value).map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onChange(color)
                      setActiveField(null)
                    }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-muted transition-colors rounded-lg text-sm font-mono"
                  >
                    <div className="w-5 h-5 rounded-md border shadow-sm" style={{ backgroundColor: color }} />
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

  const embedCode = `<!-- AssistLink Widget -->
<script src="${endpointUrl}"></script>
<script>
  AssistLink.init({
    orgId: "${orgId}",
    primaryColor: "${primaryColor}",
    accentColor: "${accentColor}"
  });
</script>`

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500 pb-12 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Widget Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your brand presence.</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full sm:w-auto rounded-xl px-8 h-11 shadow-lg shadow-primary/20">
          {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <Tabs defaultValue="design">
            <TabsList className="bg-muted/50 p-1 rounded-xl mb-4">
              <TabsTrigger value="design" className="rounded-lg px-8">Design</TabsTrigger>
              <TabsTrigger value="installation" className="rounded-lg px-8">Installation</TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-6">
              <Card className="border-none shadow-sm rounded-2xl overflow-visible">
                <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="pl-10 h-12 rounded-xl" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ColorInput label="Primary Color" value={primaryColor} onChange={setPrimaryColor} field="primary" />
                    <ColorInput label="Accent Color" value={accentColor} onChange={setAccentColor} field="accent" />
                  </div>

                  <div className="space-y-2">
                    <Label>Welcome Message</Label>
                    <Textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} className="rounded-2xl min-h-[100px] p-4 bg-muted/20 border-none" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl bg-primary/5">
                <CardHeader><CardTitle className="flex items-center gap-2 text-primary"><Wand2 className="w-5 h-5"/> AI Color Extractor</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="https://yourwebsite.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="h-12 rounded-xl bg-white" />
                  <Button onClick={() => toast({ title: "Analyzing..." })} className="w-full h-12 rounded-xl">Sync Brand Colors</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="installation">
              <Card className="border-none shadow-sm rounded-2xl">
                <CardHeader><CardTitle>Embed Code</CardTitle></CardHeader>
                <CardContent>
                  <pre className="p-4 bg-slate-950 text-slate-50 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed">
                    {embedCode}
                  </pre>
                  <Button onClick={() => { navigator.clipboard.writeText(embedCode); toast({ title: "Copied!" }) }} className="w-full mt-4 rounded-xl" variant="outline">
                    <Copy className="w-4 h-4 mr-2" /> Copy Embed Code
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="p-6 rounded-[2.5rem] bg-white border shadow-xl flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">Live Preview</span>
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