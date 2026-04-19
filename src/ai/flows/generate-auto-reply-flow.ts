import { ai } from '@/ai/genkit';
import { z } from 'zod';
import puppeteer from 'puppeteer';        // npm install puppeteer
import { Vibrant } from 'node-vibrant/node'; // npm install node-vibrant
import sharp from 'sharp';                // npm install sharp (for better image handling)

export const extractWebsiteColors = ai.defineFlow(
  {
    name: 'extractWebsiteColors',
    inputSchema: z.object({
      websiteUrl: z.string().url().describe("The customer's website URL"),
      orgId: z.string().optional(), // optional if you want to save to their config
    }),
    outputSchema: z.object({
      primaryColor: z.string().describe("Main brand color as hex, e.g. #3333CC"),
      accentColor: z.string().describe("Secondary/CTA color as hex, e.g. #1FBAF5"),
      confidence: z.number().min(0).max(1),
      extractedFrom: z.enum(['screenshot', 'favicon', 'css', 'fallback']),
      logoUrl: z.string().optional(),
    }),
  },
  async ({ websiteUrl }) => {
    let browser;
    try {
      // Launch headless browser
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      // Go to the site and wait for load
      await page.goto(websiteUrl, { waitUntil: 'networkidle2', timeout: 15000 });

      // 1. Try to get favicon / logo first (often has brand colors)
      const faviconUrl = await page.evaluate(() => {
        const link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
        return link ? (link as HTMLLinkElement).href : null;
      });

      let logoUrl = faviconUrl || `${new URL(websiteUrl).origin}/favicon.ico`;

      // 2. Take a clean screenshot of the visible area (best for dominant colors)
      const screenshotBuffer = await page.screenshot({ fullPage: false, type: 'png' });

      // 3. Extract colors using node-vibrant (very reliable)
      const palette = await Vibrant.from(screenshotBuffer).getPalette();

      // Vibrant gives: Vibrant, Muted, DarkVibrant, LightVibrant, etc.
      const vibrantHex = palette.Vibrant?.hex || '#3333CC';
      const mutedHex = palette.Muted?.hex || palette.DarkVibrant?.hex || '#1FBAF5';

      // Decide primary vs accent
      // Usually the most "Vibrant" is primary, second is accent
      let primaryColor = vibrantHex;
      let accentColor = mutedHex || vibrantHex;

      // Bonus: Try to find dominant CSS colors (body bg, buttons, etc.)
      const cssColors = await page.evaluate(() => {
        const colors: string[] = [];
        const elements = document.querySelectorAll('body, header, button, a, .btn, [style*="background"]');
        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') colors.push(style.backgroundColor);
          if (style.color) colors.push(style.color);
        });
        return [...new Set(colors)]; // unique
      });

      // Simple fallback if vibrant gives weird results
      if (!primaryColor || primaryColor === '#000000') {
        primaryColor = '#3333CC'; // your default
      }
      if (!accentColor) accentColor = '#1FBAF5';

      await browser.close();

      return {
        primaryColor,
        accentColor,
        confidence: 0.85, // high because we use real screenshot + vibrant
        extractedFrom: faviconUrl ? 'favicon' : 'screenshot',
        logoUrl: logoUrl || undefined,
      };

    } catch (error) {
      console.error("Color crawler failed for", websiteUrl, error);
      
      if (browser) await browser.close();

      // Graceful fallback (use sensible defaults or AI guess, but we keep it deterministic)
      return {
        primaryColor: '#3333CC',
        accentColor: '#1FBAF5',
        confidence: 0.4,
        extractedFrom: 'fallback',
        logoUrl: undefined,
      };
    }
  }
);