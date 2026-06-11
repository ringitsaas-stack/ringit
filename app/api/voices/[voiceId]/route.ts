import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ voiceId: string }> }
) {
  try {
    const { voiceId } = await params;
    const apiKey = process.env.RETELL_API_KEY;
    if (!apiKey) throw new Error('Missing RETELL_API_KEY');

    const response = await fetch(`https://api.retellai.com/get-voice/${voiceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Retell get-voice failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, voice: data });
  } catch (error) {
    console.error('GET voice by ID error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch voice' },
      { status: 500 }
    );
  }
}
