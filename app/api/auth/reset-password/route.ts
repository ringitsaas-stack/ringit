import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ResetPasswordEmail } from '@/components/emails/ResetPasswordEmail';
import { getSupabaseClient } from '@/shared/lib/supabase-client';

const getResendClientSafe = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY environment variable is not defined.');
    return null;
  }
  return new Resend(apiKey);
};

export async function POST(request: Request) {
  try {
    const { email, resetUrl } = await request.json();
    if (!email || !resetUrl) {
      return NextResponse.json({ success: false, error: 'Missing required parameters: email, resetUrl' }, { status: 400 });
    }

    // Try retrieving full name from profiles database if possible
    let fullName = 'Active User';
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('email', email)
        .maybeSingle();
      if (data?.full_name) {
        fullName = data.full_name;
      }
    } catch {
      // Sandbox/Fallback mode
    }

    const resend = getResendClientSafe();
    if (resend) {
      const resendFrom = process.env.RESEND_FROM_OVERRIDE || 'Ringit AI <hello@ringitai.com>';
      const resendTo = process.env.RESEND_TO_OVERRIDE || email;

      const { data, error } = await resend.emails.send({
        from: resendFrom,
        to: [resendTo],
        subject: 'Reset your Ringit.ai Password ⚡',
        react: ResetPasswordEmail({ fullName, resetUrl }),
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    } else {
      // Sandbox simulated response
      console.log(`[Resend Sandbox Link] Reset password for ${email} with url: ${resetUrl}`);
      return NextResponse.json({ success: true, sandbox: true });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
