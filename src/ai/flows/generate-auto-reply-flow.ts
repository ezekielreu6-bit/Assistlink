import { ai } from '@/ai/genkit'; // your genkit setup
import { z } from 'zod';

export const generateAutoReply = ai.defineFlow(
  {
    name: 'generateAutoReply',
    inputSchema: z.object({
      customerMessage: z.string(),
      conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })),
      orgConfig: z.object({
        companyName: z.string(),
        welcomeMessage: z.string().optional(),
        customInstructions: z.string().optional(),
      }),
    }),
    outputSchema: z.object({
      reply: z.string(),
    }),
  },
  async ({ customerMessage, conversationHistory, orgConfig }) => {
    const systemPrompt = `
You are a helpful, friendly, and professional AI assistant for ${orgConfig.companyName}.
${orgConfig.customInstructions ? `Additional instructions: ${orgConfig.customInstructions}` : ''}

Rules:
- Be concise but warm (1-3 sentences max unless complex).
- Never promise things you can't deliver.
- If the question is sensitive (billing, refunds, account access), say you're escalating to a human.
- Always offer a clear next step or ask for clarification if needed.
- Use the conversation history for context.
`;

    const chatHistory = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const { text } = await ai.generate({
      model: ai.model('gemini-1.5-flash'), // or your preferred model
      prompt: `\( {systemPrompt}\n\nRecent conversation:\n \){chatHistory}\n\nCustomer: ${customerMessage}\n\nAssistant:`,
    });

    return { reply: text };
  }
);