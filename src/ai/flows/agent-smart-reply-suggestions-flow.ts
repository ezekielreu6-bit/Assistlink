'use server';
/**
 * @fileOverview This file implements a Genkit flow for providing smart reply suggestions to support agents.
 *
 * - agentSmartReplySuggestions - A function that suggests relevant quick replies based on customer messages.
 * - AgentSmartReplySuggestionsInput - The input type for the agentSmartReplySuggestions function.
 * - AgentSmartReplySuggestionsOutput - The return type for the agentSmartReplySuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AgentSmartReplySuggestionsInputSchema = z.object({
  customerMessage: z.string().describe('The most recent message from the customer.'),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'agent']).describe('The role of the speaker (user or agent).'),
        message: z.string().describe('The content of the message.'),
      })
    )
    .optional()
    .describe('An optional array of previous messages in the conversation, providing context.'),
});
export type AgentSmartReplySuggestionsInput = z.infer<typeof AgentSmartReplySuggestionsInputSchema>;

const AgentSmartReplySuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested quick replies for the agent.'),
});
export type AgentSmartReplySuggestionsOutput = z.infer<typeof AgentSmartReplySuggestionsOutputSchema>;

export async function agentSmartReplySuggestions(input: AgentSmartReplySuggestionsInput): Promise<AgentSmartReplySuggestionsOutput> {
  return agentSmartReplySuggestionsFlow(input);
}

const smartReplyPrompt = ai.definePrompt({
  name: 'smartReplyPrompt',
  input: { schema: AgentSmartReplySuggestionsInputSchema },
  output: { schema: AgentSmartReplySuggestionsOutputSchema },
  prompt: `You are an AI assistant designed to help support agents by suggesting quick, relevant replies.
Your goal is to provide concise and helpful responses based on the customer's message and the conversation history.
Suggest up to 3 quick replies.

Conversation History:
{{#each conversationHistory}}
  {{this.role}}: {{this.message}}
{{/each}}

Customer Message: {{{customerMessage}}}

Suggested Replies:`,
});

const agentSmartReplySuggestionsFlow = ai.defineFlow(
  {
    name: 'agentSmartReplySuggestionsFlow',
    inputSchema: AgentSmartReplySuggestionsInputSchema,
    outputSchema: AgentSmartReplySuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await smartReplyPrompt(input);
    return output!;
  }
);
