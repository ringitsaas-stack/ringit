import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    // 1. Initialize Supabase Admin Client
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
      throw new Error('Missing environment variables')
    }
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 2. Fetch Leads from the last 7 days grouped by user_id
    // We join the profiles table to get the user's email address
    const { data: leads, error } = await supabaseAdmin
      .from('leads')
      .select(`
        id,
        name,
        phone,
        intent,
        summary,
        created_at,
        user_id,
        profiles!inner(email)
      `)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({ message: "No leads in the past 7 days." }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    // 3. Group leads by user
    const userLeads = new Map<string, { email: string; leads: any[] }>()
    
    for (const lead of leads) {
      const email = lead.profiles?.email
      if (!email) continue;
      
      if (!userLeads.has(lead.user_id)) {
        userLeads.set(lead.user_id, { email, leads: [] })
      }
      userLeads.get(lead.user_id)?.leads.push(lead)
    }

    // 4. Format and send email to each user using Resend
    let emailsSent = 0
    for (const [userId, data] of userLeads.entries()) {
      let htmlBody = `<h2>Your Weekly AI Receptionist Leads</h2><p>Here are your new leads from the past 7 days:</p><ul>`
      
      data.leads.forEach(l => {
        htmlBody += `<li>
          <strong>Name:</strong> ${l.name || 'Unknown'}<br/>
          <strong>Phone:</strong> ${l.phone || 'Not provided'}<br/>
          <strong>Intent:</strong> ${l.intent || 'Unknown'}<br/>
          <strong>Details:</strong> ${l.summary || 'N/A'}<br/>
          <em>Received: ${new Date(l.created_at).toLocaleString()}</em>
        </li><br/>`
      })
      
      htmlBody += `</ul><p>Login to your Ringit.ai dashboard to manage your AI agents!</p>`

      // Call Resend API
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Ringit AI <hello@ringit.ai>', // Make sure this domain is verified in Resend!
          to: [data.email],
          subject: 'Your Weekly AI Leads Summary',
          html: htmlBody
        })
      })

      if (res.ok) emailsSent++
    }

    return new Response(JSON.stringify({ message: `Successfully sent ${emailsSent} weekly lead emails.` }), {
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
