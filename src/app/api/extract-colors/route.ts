import { NextResponse } from 'next/server'
import { extractWebsiteColors } from '@/ai/flows/website-color-extractor-flow'

export async function POST(req: Request) {
  try {
    const { websiteUrl } = await req.json()

    if (!websiteUrl || typeof websiteUrl !== 'string') {
      return NextResponse.json({ error: 'Valid website URL is required' }, { status: 400 })
    }

    const result = await extractWebsiteColors({ websiteUrl })

    return NextResponse.json({
      primaryColor: result.primaryColor,
      accentColor: result.accentColor,
      confidence: result.confidence,
      extractedFrom: result.extractedFrom,
    })
  } catch (error) {
    console.error('Color extraction API error:', error)
    return NextResponse.json(
      { error: 'Failed to extract colors from website' },
      { status: 500 }
    )
  }
}