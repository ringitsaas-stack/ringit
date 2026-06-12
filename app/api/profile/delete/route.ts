import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/shared/lib/supabase-client';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId parameter' }, { status: 400 });
    }

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch {
      // Sandbox fallback mode
      return NextResponse.json({ success: true, message: 'Account deleted successfully (Simulation Sandbox).' });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ deleted: true })
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
