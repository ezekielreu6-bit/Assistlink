import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const extractWebsiteColors = ai.defineFlow(
  {
    name: 'extractWebsiteColors',
    inputSchema: z.object({
      websiteUrl: z.string().url(),
    }),
    outputSchema: z.object({
      primaryColor: z.string(),
      accentColor: z.string(),
      confidence: z.number(),
      extractedFrom: z.string(),
    }),
  },
  async ({ websiteUrl }) => {
    try {
      // Fetch the page HTML
      const response = await fetch(websiteUrl, { 
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AssistLinkBot/1.0)' } 
      });
      
      if (!response.ok) throw new Error('Failed to fetch site');

      const html = await response.text();

      // Extract colors from inline styles, meta tags, and common patterns
      const colorMatches = html.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b|rgb[a]?\([^)]+\)/g) || [];

      const uniqueColors = [...new Set(colorMatches.map(c => c.toUpperCase()))];

      // Simple heuristic: first dark/vibrant color = primary, second = accent
      let primary = '#3333CC';
      let accent = '#1FBAF5';

      if (uniqueColors.length > 0) {
        primary = uniqueColors[0];
      }
      if (uniqueColors.length > 1) {
        accent = uniqueColors[1];
      }

      // Bonus: Look for common brand color in meta or favicon (optional enhancement)
      return {
        primaryColor: primary,
        accentColor: accent,
        confidence: uniqueColors.length > 3 ? 0.75 : 0.5,
        extractedFrom: 'html-parsing',
      };
    } catch (error) {
      console.error('Color extraction failed:', error);
      
      // Graceful fallback
      return {
        primaryColor: '#3333CC',
        accentColor: '#1FBAF5',
        confidence: 0.3,
        extractedFrom: 'fallback',
      };
    }
  }
);