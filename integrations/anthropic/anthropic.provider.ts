import Anthropic from '@anthropic-ai/sdk';
import { IAnthropicProvider, LeadSummary } from './anthropic.interface';

export class AnthropicProvider implements IAnthropicProvider {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Missing ANTHROPIC_API_KEY environment variable.');
    }
    this.client = new Anthropic({ apiKey });
  }

  async summarizeLead(transcript: string): Promise<LeadSummary> {
    try {
      const prompt = `
You are an expert CRM data extraction assistant.
Analyze the following call transcript and extract:
1. The caller's name (Use "Unknown" if not mentioned or clear).
2. The caller's phone number (Use "Not provided" if not stated in conversation).
3. The intent of the call (e.g., "Wants to book a root canal on Tuesday morning", "Needs AC repair quote").
4. A brief, one-sentence summary of the conversation.

Respond with valid JSON only. Do not include markdown code block formatting (no \`\`\`json tags), do not include any conversational filler. Just the raw JSON object matching the following structure:
{
  "name": "...",
  "phone": "...",
  "intent": "...",
  "summary": "..."
}

Transcript:
${transcript}
`;

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        temperature: 0.0,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const firstContent = response.content[0];
      if (!firstContent || firstContent.type !== 'text') {
        throw new Error('Anthropic returned an empty or invalid content blocks response.');
      }

      let textContent = firstContent.text.trim();
      
      // Clean up markdown block wrappers if LLM still returned them
      if (textContent.startsWith('```')) {
        textContent = textContent.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      }

      const parsed: LeadSummary = JSON.parse(textContent);

      return {
        name: parsed.name || 'Unknown',
        phone: parsed.phone || 'Not provided',
        intent: parsed.intent || 'Unknown intent',
        summary: parsed.summary || 'No summary generated.',
      };
    } catch (error) {
      console.error('Anthropic summarizeLead error:', error);
      // Return graceful fallback details in case of JSON parsing or API failure
      return {
        name: 'Unknown',
        phone: 'Not provided',
        intent: 'Failed to extract intent',
        summary: 'Error processing transcript for lead details.',
      };
    }
  }
}
