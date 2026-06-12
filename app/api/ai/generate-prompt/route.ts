import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { businessName, services, tone } = await request.json();
    if (!businessName) {
      return NextResponse.json({ success: false, error: 'Missing businessName' }, { status: 400 });
    }

    const openAiKey = process.env.OPEN_AI_API_KEY || process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      return NextResponse.json({ success: false, error: 'OpenAI API key (OPEN_AI_API_KEY) is not set in environment variables.' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: openAiKey });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert prompt engineer for Retell AI voice receptionists. Create a natural, detailed, and highly effective system prompt receptionist template. Do not include markdown block wrappers or markdown formatting in your response.'
        },
        {
          role: 'user',
          content: `Write a system prompt receptionist template for the business "${businessName}".
Business Details & Services: "${services || 'General customer support and query answering.'}"
Desired Voice Tone: "${tone || 'Warm and friendly'}"

Ensure the prompt instructs the AI receptionist to:
- Be helpful, polite, and stick strictly to the services and rules provided.
- Answer user queries naturally.
- Keep responses relatively brief (ideal for voice conversation).
- Speak in the specified tone: ${tone}.

Format the response as raw text prompt only, with no markdown formatting or headers.`
        }
      ],
      temperature: 0.7
    });

    const systemPrompt = completion.choices[0]?.message?.content?.trim() || '';
    if (!systemPrompt) {
      throw new Error('OpenAI API returned an empty response');
    }

    return NextResponse.json({ success: true, prompt: systemPrompt });
  } catch (err: any) {
    let errMsg = err.message || 'Generation failed';
    if (errMsg.includes('sk-') || errMsg.includes('API key')) {
      errMsg = 'Incorrect or invalid OpenAI API key provided.';
    }
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
