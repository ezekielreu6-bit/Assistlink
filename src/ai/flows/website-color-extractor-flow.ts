'use server';
/**
 * @fileOverview This flow extracts dominant brand colors from a website screenshot.
 *
 * - extractWebsiteColors - A function that handles the website color extraction process.
 * - WebsiteColorExtractorInput - The input type for the extractWebsiteColors function.
 * - WebsiteColorExtractorOutput - The return type for the extractWebsiteColors function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WebsiteColorExtractorInputSchema = z.object({
  screenshotDataUri: z
    .string()
    .describe(
      "A screenshot of the website, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  websiteUrl: z
    .string()
    .url()
    .optional()
    .describe(
      'The URL of the website from which the screenshot was taken, provided for additional context if available.'
    ),
});
export type WebsiteColorExtractorInput = z.infer<
  typeof WebsiteColorExtractorInputSchema
>;

const WebsiteColorExtractorOutputSchema = z.object({
  colors: z
    .array(z.string().regex(/^#[0-9A-Fa-f]{6}$/))
    .describe(
      'An array of dominant brand colors extracted from the website screenshot, in hexadecimal format (e.g., ["#RRGGBB", "#AABBCC"]).'
    ),
});
export type WebsiteColorExtractorOutput = z.infer<
  typeof WebsiteColorExtractorOutputSchema
>;

export async function extractWebsiteColors(
  input: WebsiteColorExtractorInput
): Promise<WebsiteColorExtractorOutput> {
  return websiteColorExtractorFlow(input);
}

const extractWebsiteColorsPrompt = ai.definePrompt({
  name: 'extractWebsiteColorsPrompt',
  input: { schema: WebsiteColorExtractorInputSchema },
  output: { schema: WebsiteColorExtractorOutputSchema },
  prompt: `You are an expert color analyst for branding and design.

Your task is to analyze the provided website screenshot and identify the most dominant brand colors present.
Focus on colors that appear frequently in headers, footers, call-to-action buttons, and large background areas, as these are typically representative of a brand's identity.

Identify 3 to 5 dominant colors. For each color, provide its hexadecimal representation (e.g., #RRGGBB).

Here is the website screenshot for analysis:

{{media url=screenshotDataUri}}

{{#if websiteUrl}}
For context, this screenshot was taken from the website: {{{websiteUrl}}}
{{/if}}

Please return the dominant colors as a JSON array of hexadecimal strings.`,
});

const websiteColorExtractorFlow = ai.defineFlow(
  {
    name: 'websiteColorExtractorFlow',
    inputSchema: WebsiteColorExtractorInputSchema,
    outputSchema: WebsiteColorExtractorOutputSchema,
  },
  async (input) => {
    const { output } = await extractWebsiteColorsPrompt(input);
    return output!;
  }
);
