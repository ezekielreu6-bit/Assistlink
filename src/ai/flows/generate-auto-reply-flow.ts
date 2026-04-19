import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const generateAutoReply = ai.defineFlow(
  {
    name: 'generateAutoReply',
    inputSchema: z.object({
      customerMessage: z.string().min(1),
      conversationHistory: z.array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })
      ).default([]),
      orgConfig: z.object({
        companyName: z.string().default('Support'),
        customInstructions: z.string().optional(),
        welcomeMessage: z.string().optional(),
      }),
    }),
    outputSchema: z.object({
      reply: z.string().min(5),
    }),
  },
  async ({ customerMessage, conversationHistory, orgConfig }) => {
    // Build a strong system prompt
    const systemPrompt = `
You are a friendly, professional, and helpful AI support assistant for ${orgConfig.companyName}.

${orgConfig.customInstructions ? `Additional company guidelines: ${orgConfig.customInstructions}` : ''}

Core Rules:
- Keep replies concise, warm, and actionable (1-3 sentences maximum).
- Sound human and empathetic.
- If the question involves billing, refunds, account access, or sensitive data, respond politely and say you are escalating to a human agent.
- Always offer a clear next step or ask for more details when needed.
- Use the conversation history to maintain context.
- Never make promises you cannot keep.

Tone: Helpful, calm, and solution-oriented.
`;

    // Format history for the model
    const formattedHistory = conversationHistory
      .map((msg) => `${msg.role === 'user' ? 'Customer' : 'You'}: ${msg.content}`)
      .join('\n\n');

    const fullPrompt = `${systemPrompt}

Recent conversation:
${formattedHistory}

Customer: ${customerMessage}

You:`;

    try {
      const { text } = await ai.generate({
        model: ai.model('gemini-1.5-flash'), // Fast & cost-effective. Change to gemini-1.5-pro if needed for better quality
        prompt: fullPrompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      });

      const cleanReply = text.trim();

      // Fallback if model returns something too short or empty
      if (!cleanReply || cleanReply.length < 10) {
        return {
          reply: `Thank you for your message. I'll look into this right away and get back to you shortly. Is there anything else I can help with?`,
        };
      }

      return { reply: cleanReply };
    } catch (error) {
      console.error('Auto-reply generation failed:', error);
      
      // Safe fallback reply
      return {
        reply: `Hi! Thanks for reaching out. Our team is looking into your request and will respond as soon as possible.`,
      };
    }
  }
);