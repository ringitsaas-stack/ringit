import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { businessName, industry, services: existingServices } = await request.json();
    if (!businessName || !industry) {
      return NextResponse.json({ success: false, error: 'Missing businessName or industry' }, { status: 400 });
    }

    const openAiKey = process.env.OPEN_AI_API_KEY || process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      return NextResponse.json({ success: false, error: 'OpenAI API key (OPEN_AI_API_KEY) is not set in environment variables.' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: openAiKey });

    const userPrompt = existingServices?.trim()
      ? `For a business named "${businessName}" in the "${industry}" industry, we have some raw service details:
"${existingServices}"

Improve, correct, and expand these raw details into a polished, comprehensive, and professional Services description for the AI receptionist. Include sample pricing or scheduling rules if mentioned. Keep the final result to 2-3 sentences, clear and informative.
Also, choose the single most appropriate tone option from these exact values: "Warm and friendly", "Professional and formal", "Upbeat and energetic", "Calm and reassuring", "Direct and concise", "Empathetic and supportive".

Respond ONLY with valid JSON. Do not include markdown code block formatting. Format:
{
  "services": "...",
  "tone": "..."
}`
      : `For a business named "${businessName}" in the "${industry}" industry, generate:
1. "services": A detailed paragraph describing their services, sample pricing, and appointment booking/scheduling guidelines that an AI phone receptionist needs to know. Keep it to 2-3 sentences, informative and practical.
2. "tone": Choose the single most appropriate tone option from these exact values: "Warm and friendly", "Professional and formal", "Upbeat and energetic", "Calm and reassuring", "Direct and concise", "Empathetic and supportive".

Respond ONLY with valid JSON. Do not include markdown code block formatting. Format:
{
  "services": "...",
  "tone": "..."
}`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI receptionist profile builder. Generate a realistic and comprehensive Services and Tone configuration for a business receptionist.'
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const messageContent = completion.choices[0]?.message?.content;
    if (messageContent) {
      const content = JSON.parse(messageContent);
      let tone = content.tone;
      const services = content.services;

      // Double-check the tone is one of the valid wizard selection options
      const validTones = [
        'Warm and friendly',
        'Professional and formal',
        'Upbeat and energetic',
        'Calm and reassuring',
        'Direct and concise',
        'Empathetic and supportive'
      ];
      if (!validTones.includes(tone)) {
        tone = 'Warm and friendly';
      }

      return NextResponse.json({ success: true, services, tone });
    } else {
      throw new Error('OpenAI API returned an empty response');
    }
  } catch (err: any) {
    let errMsg = err.message || 'Generation failed';
    if (errMsg.includes('sk-') || errMsg.includes('API key')) {
      errMsg = 'Incorrect or invalid OpenAI API key provided.';
    }
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
