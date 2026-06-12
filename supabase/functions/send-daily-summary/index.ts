import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
      throw new Error('Missing environment variables')
    }
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch Calls from the last 24 hours grouped by agent's lead_email
    const timeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: calls, error } = await supabaseAdmin
      .from('calls')
      .select(`
        id,
        caller_phone,
        duration_seconds,
        summary,
        created_at,
        user_id,
        agents!inner(business_name, lead_email),
        profiles!inner(full_name)
      `)
      .gte('created_at', timeLimit)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    if (!calls || calls.length === 0) {
      return new Response(JSON.stringify({ message: "No new calls in the past 24 hours." }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    // Group calls by lead_email
    const emailCalls = new Map<string, { email: string; fullName: string; calls: any[] }>()
    
    for (const call of calls) {
      const email = call.agents?.lead_email
      const fullName = call.profiles?.full_name || 'Active User'
      if (!email) continue;
      
      if (!emailCalls.has(email)) {
        emailCalls.set(email, { email, fullName, calls: [] })
      }
      emailCalls.get(email)?.calls.push(call)
    }

    let emailsSent = 0
    for (const [emailAddress, data] of emailCalls.entries()) {
      let tableRows = ''
      data.calls.forEach(c => {
        const durationMin = Math.floor(c.duration_seconds / 60)
        const durationSec = c.duration_seconds % 60
        const durationStr = `${durationMin}m ${durationSec}s`

        tableRows += `
          <tr style="border-bottom: 1px solid #27272a;">
            <td style="padding: 12px; color: #ffffff; font-size: 13px;">${c.agents?.business_name || 'N/A'}</td>
            <td style="padding: 12px; font-weight: bold; color: #ffffff;">${c.caller_phone || 'Unknown'}</td>
            <td style="padding: 12px; color: #a1a1aa;">${durationStr}</td>
            <td style="padding: 12px; color: #a1a1aa; font-size: 12px;">${c.summary || 'N/A'}</td>
          </tr>
        `
      })

      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Daily Calls & Leads Report</title>
        </head>
        <body style="font-family: sans-serif; background-color: #09090b; padding: 40px; color: #fafafa; margin: 0;">
          <div style="max-w: 700px; margin: 0 auto; background-color: #18181b; borderRadius: 16px; border: 1px solid #27272a; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            <div style="font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 8px; text-align: center;">
              Ringit<span style="color: '#1248de'"></span>
            </div>
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; margin-bottom: 24px; text-align: center; font-weight: bold;">
              Daily Calls Summary Report
            </div>
            
            <h2 style="font-size: 18px; color: #ffffff; margin-bottom: 12px; font-weight: bold;">Hi ${data.fullName},</h2>
            <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
              Here are your receptionist call details from the last 24 hours:
            </p>

            <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 24px;">
              <thead>
                <tr style="border-bottom: 2px solid #27272a; color: #ffffff; font-size: 12px; text-transform: uppercase;">
                  <th style="padding: 12px; font-weight: bold;">Agent</th>
                  <th style="padding: 12px; font-weight: bold;">Caller Phone</th>
                  <th style="padding: 12px; font-weight: bold;">Duration</th>
                  <th style="padding: 12px; font-weight: bold;">Summary</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>

            <div style="text-align: center; margin-top: 32px; margin-bottom: 16px;">
              <a href="https://ringitai.com/dashboard" style="display: inline-block; background-color: #1248de; color: #ffffff; font-size: 13px; font-weight: bold; padding: 12px 28px; borderRadius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(18,72,222,0.35);">
                Open Dashboard ⚡
              </a>
            </div>

            <hr style="border: none; border-top: 1px dashed #27272a; margin: 32px 0;" />
            <p style="font-size: 11px; text-align: center; color: #71717a; line-height: 1.5;">
              This is an automated daily report from your Ringit account. To manage your active call forwards, settings, or alerts, visit your portal settings panel.
            </p>
          </div>
        </body>
        </html>
      `

      const resendFrom = Deno.env.get('RESEND_FROM_OVERRIDE') || 'Ringit AI Summary <summary@ringitai.com>'
      const resendTo = Deno.env.get('RESEND_TO_OVERRIDE') ? [Deno.env.get('RESEND_TO_OVERRIDE')!] : [data.email]

      // Call Resend API
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: resendFrom,
          to: resendTo,
          subject: 'Your Daily AI Leads Report ⚡',
          html: htmlBody
        })
      })

      if (res.ok) {
        emailsSent++
      } else {
        const errJson = await res.json().catch(() => ({}));
        return new Response(JSON.stringify({ 
          error: "Resend API error", 
          status: res.status, 
          details: errJson 
        }), {
          headers: { "Content-Type": "application/json" },
          status: 400
        });
      }
    }

    return new Response(JSON.stringify({ message: `Successfully sent ${emailsSent} daily leads summary emails.` }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
})
