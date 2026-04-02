"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ChatPreview } from '@/components/chat-preview'
import { Wand2, Copy, Check, Loader2, Palette, Terminal, Globe } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { extractWebsiteColors } from '@/ai/flows/website-color-extractor-flow'

export default function SettingsPage() {
  const [primaryColor, setPrimaryColor] = useState('#3333CC')
  const [accentColor, setAccentColor] = useState('#1FBAF5')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleAiExtract = async () => {
    if (!websiteUrl) {
      toast({ title: "URL Required", description: "Please enter a website URL first.", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      // For demo purposes, we'll simulate the flow with a prompt if needed 
      // but the actual flow takes a screenshot data URI which we don't have in a simple client-side mock
      // So we'll use a placeholder behavior or mock if screenshot is missing.
      // Normally, you'd capture the screen. Here we'll show the UI flow.
      
      // MOCK BEHAVIOR as screenshotting is complex without a backend worker
      setTimeout(() => {
        setPrimaryColor('#4F46E5')
        setAccentColor('#06B6D4')
        setLoading(false)
        toast({ title: "Colors Extracted", description: "AI suggested new brand colors for your widget." })
      }, 1500)
    } catch (error) {
      toast({ title: "Extraction Failed", description: "Could not analyze website colors.", variant: "destructive" })
      setLoading(false)
    }
  }

  const embedCode = `<script src="https://cdn.assistlink.com/v1/widget.js"></script>
<script>
  AssistLink.init({
    token: "AL-7732-XJ99",
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
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Widget Customization</h1>
        <p className="text-muted-foreground mt-1">Design your chat widget to match your brand identity.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          <Tabs defaultValue="design" className="w-full">
            <TabsList className="bg-muted/50 p-1 rounded-xl mb-4">
              <TabsTrigger value="design" className="rounded-lg px-6">
                <Palette className="w-4 h-4 mr-2" />
                Design
              </TabsTrigger>
              <TabsTrigger value="installation" className="rounded-lg px-6">
                <Terminal className="w-4 h-4 mr-2" />
                Installation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-6">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">AI Smart Theme</CardTitle>
                  </div>
                  <CardDescription>Enter your website URL to automatically extract your brand colors.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="https://yourbrand.com" 
                        className="pl-10 h-12 rounded-xl"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleAiExtract} 
                      disabled={loading}
                      className="h-12 rounded-xl px-6 bg-accent hover:bg-accent/90"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Extract Colors"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Manual Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Primary Color</Label>
                      <div className="flex gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg border shadow-inner shrink-0" 
                          style={{ backgroundColor: primaryColor }}
                        />
                        <Input 
                          value={primaryColor} 
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="font-mono rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Accent Color</Label>
                      <div className="flex gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg border shadow-inner shrink-0" 
                          style={{ backgroundColor: accentColor }}
                        />
                        <Input 
                          value={accentColor} 
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="font-mono rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Label className="text-sm font-semibold">Welcome Message</Label>
                    <Textarea 
                      placeholder="Hi! How can we help you today?" 
                      className="rounded-xl min-h-[100px] bg-muted/20"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="installation">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Embed Code</CardTitle>
                  <CardDescription>Copy and paste this code before the closing &lt;/body&gt; tag of your website.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative group">
                    <pre className="p-6 bg-muted rounded-2xl overflow-x-auto text-xs font-mono leading-relaxed text-foreground/80 border border-border">
                      {embedCode}
                    </pre>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyEmbed}
                      className="absolute top-4 right-4 bg-white/50 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-5 sticky top-24">
          <div className="p-4 rounded-3xl bg-muted/30 border border-dashed border-border/50">
            <p className="text-xs font-bold text-center uppercase tracking-widest text-muted-foreground mb-6">Live Preview</p>
            <div className="flex justify-center">
              <ChatPreview 
                primaryColor={primaryColor} 
                accentColor={accentColor}
                companyName="YourBrand"
                welcomeMessage="Hi! How can we help you today?"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
