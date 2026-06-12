import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    const { businessName, industry } = await request.json();
    if (!businessName || !industry) {
      return NextResponse.json({ success: false, error: 'Missing businessName or industry' }, { status: 400 });
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    let services = '';
    let tone = 'Warm and friendly';

    if (openAiKey && !openAiKey.includes('your') && openAiKey.startsWith('sk-')) {
      // Direct call to OpenAI API using native fetch
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI receptionist profile builder. Generate a realistic and comprehensive Services and Tone configuration for a business receptionist.'
            },
            {
              role: 'user',
              content: `For a business named "${businessName}" in the "${industry}" industry, generate:
1. "services": A detailed paragraph describing their services, sample pricing, and appointment booking/scheduling guidelines that an AI phone receptionist needs to know. Keep it to 2-3 sentences, informative and practical.
2. "tone": Choose the single most appropriate tone option from these exact values: "Warm and friendly", "Professional and formal", "Upbeat and energetic".

Respond ONLY with valid JSON. Do not include markdown code block formatting. Format:
{
  "services": "...",
  "tone": "..."
}`
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        services = content.services;
        tone = content.tone;
      } else {
        throw new Error('OpenAI API request failed');
      }
    } else if (anthropicKey && !anthropicKey.includes('youranthropicapikey')) {
      // Call Anthropic API
      const anthropic = new Anthropic({ apiKey: anthropicKey });
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: `For a business named "${businessName}" in the "${industry}" industry, generate:
1. "services": A detailed paragraph describing their services, sample pricing, and appointment booking/scheduling guidelines that an AI phone receptionist needs to know. Keep it to 2-3 sentences, informative and practical.
2. "tone": Choose the single most appropriate tone option from these exact values: "Warm and friendly", "Professional and formal", "Upbeat and energetic".

Respond ONLY with valid JSON (no markdown wrappers like \`\`\`json). Format:
{
  "services": "...",
  "tone": "..."
}`
          }
        ]
      });

      const firstContent = response.content[0];
      if (firstContent && firstContent.type === 'text') {
        let textContent = firstContent.text.trim();
        if (textContent.startsWith('```')) {
          textContent = textContent.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }
        const content = JSON.parse(textContent);
        services = content.services;
        tone = content.tone;
      } else {
        throw new Error('Anthropic API request failed');
      }
    } else {
      // Mock / Sandbox fallback in case no API keys are configured
      services = `Welcome to ${businessName}! We specialize in professional services for the ${industry} industry. Our standard service packages start from $150, and we offer custom consultations. Bookings can be scheduled via our reception team during normal working hours.`;
      tone = industry.toLowerCase().includes('corporate') || industry.toLowerCase().includes('law') ? 'Professional and formal' : 'Warm and friendly';
    }

    // Double-check the tone is one of the valid wizard selection options
    const validTones = ['Warm and friendly', 'Professional and formal', 'Upbeat and energetic'];
    if (!validTones.includes(tone)) {
      tone = 'Warm and friendly';
    }

    return NextResponse.json({ success: true, services, tone });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Generation failed' }, { status: 500 });
  }
}
