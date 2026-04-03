
"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ChatPreview } from '@/components/chat-preview'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Wand2, Copy, Check, Loader2, Palette, Terminal, Globe, Link as LinkIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { extractWebsiteColors } from '@/ai/flows/website-color-extractor-flow'
import { useUser } from '@/firebase'

export default function SettingsPage() {
  const { user } = useUser()
  const [primaryColor, setPrimaryColor] = useState('#3333CC')
  const [accentColor, setAccentColor] = useState('#1FBAF5')
  const [websiteUrl, setWebsiteUrl] = useState('https://assistlink.vercel.app')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const orgId = user?.email ? user.email.replace(/\./g, '_') : 'AL-USER-1'
  const endpointUrl = `https://assistlink.vercel.app/api/widget?id=${orgId}`

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

      const result = await extractWebsiteColors({
        screenshotDataUri: dataUri,
        websiteUrl: websiteUrl
      });

      if (result.colors && result.colors.length >= 2) {
        setPrimaryColor(result.colors[0]);
        setAccentColor(result.colors[1]);
        toast({ title: "Colors Extracted", description: "AI identified your brand colors from the visual profile." })
      } else {
        throw new Error("No colors returned");
      }
    } catch (error) {
      toast({ title: "Extraction Failed", description: "Could not analyze website colors. Please check the URL.", variant: "destructive" })
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

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: "Copied!", description: "Embed code copied to clipboard." })
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Widget Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your widget endpoint and visual styling.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          <Tabs defaultValue="installation" className="w-full">
            <ScrollArea className="w-full">
              <TabsList className="bg-muted/50 p-1 rounded-xl mb-4 inline-flex min-w-full sm:min-w-0">
                <TabsTrigger value="installation" className="rounded-lg px-6 flex-1 sm:flex-none">
                  <Terminal className="w-4 h-4 mr-2" />
                  Installation
                </TabsTrigger>
                <TabsTrigger value="design" className="rounded-lg px-6 flex-1 sm:flex-none">
                  <Palette className="w-4 h-4 mr-2" />
                  Design
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <TabsContent value="installation" className="space-y-6">
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10 p-4 sm:p-6">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base sm:text-lg">Endpoint URL</CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm">This is your unique real-time messaging endpoint.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-2">
                    <Input readOnly value={endpointUrl} className="font-mono text-[10px] sm:text-xs bg-muted/20 h-10 sm:h-12" />
                    <Button variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 shrink-0" onClick={() => {
                      navigator.clipboard.writeText(endpointUrl)
                      toast({ title: "Endpoint Copied" })
                    }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Embed Code</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Copy and paste this code before the closing &lt;/body&gt; tag of your website.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="relative group">
                    <pre className="p-4 sm:p-6 bg-muted rounded-2xl overflow-x-auto text-[10px] sm:text-xs font-mono leading-relaxed text-foreground/80 border border-border">
                      {embedCode}
                    </pre>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyEmbed}
                      className="mt-4 sm:mt-0 sm:absolute sm:top-4 sm:right-4 bg-white/80 backdrop-blur rounded-xl shadow-sm border-none w-full sm:w-auto h-10 sm:h-9"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="ml-2">{copied ? "Copied" : "Copy"}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="design" className="space-y-6">
              <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="bg-primary/5 border-b border-primary/10 p-4 sm:p-6">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base sm:text-lg">AI Smart Theme</CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm">Extract dominant colors from your website visual profile.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="relative w-full">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="https://yourbrand.com" 
                        className="pl-10 h-11 sm:h-12 rounded-xl bg-muted/20 border-none w-full"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleAiExtract} 
                      disabled={loading}
                      className="w-full h-11 sm:h-12 rounded-xl px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                      {loading ? "Analyzing..." : "Extract Colors"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Appearance</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Primary Color</Label>
                      <div className="flex gap-3">
                        <div 
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-white shadow-md shrink-0" 
                          style={{ backgroundColor: primaryColor }}
                        />
                        <Input 
                          value={primaryColor} 
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="font-mono rounded-xl h-10 sm:h-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Accent Color</Label>
                      <div className="flex gap-3">
                        <div 
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-white shadow-md shrink-0" 
                          style={{ backgroundColor: accentColor }}
                        />
                        <Input 
                          value={accentColor} 
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="font-mono rounded-xl h-10 sm:h-12"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="text-sm font-semibold">Welcome Message</Label>
                    <Textarea 
                      placeholder="Hi! How can we help you today?" 
                      className="rounded-2xl min-h-[100px] bg-muted/20 border-none p-4"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white border border-border/50 shadow-xl shadow-primary/5">
            <p className="text-[10px] font-bold text-center uppercase tracking-[0.2em] text-muted-foreground mb-4 sm:mb-8">Live Preview</p>
            <div className="flex justify-center scale-90 sm:scale-100">
              <ChatPreview 
                primaryColor={primaryColor} 
                accentColor={accentColor}
                companyName="AssistLink"
                welcomeMessage="Hi! How can we help you today?"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
