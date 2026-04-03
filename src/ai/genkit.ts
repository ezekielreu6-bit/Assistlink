import { genkit } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  
  model: 'googleai/gemini-1.5-flash',
});