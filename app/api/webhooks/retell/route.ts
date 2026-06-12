import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { CallRepository } from '@/features/calls/repositories/call.repository';
import { getSupabaseAdmin } from '@/shared/lib/supabase-client';
import { AnthropicProvider } from '@/integrations/anthropic/anthropic.provider';
import { AppError, handleRouteError, Json } from '@/shared/lib/errors';

interface WebhookAgent {
  id: string;
  user_id: string;
  business_name: string;
  google_sheet_url: string;
  phone_numbers: { twilio_phone_number: string }[] | null;
}

// Helper to verify HMAC signature from Retell
function verifyRetellSignature(bodyText: string, signature: string | null): boolean {
  const secret = process.env.RETELL_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('RETELL_WEBHOOK_SECRET is not configured. Signature verification bypassed for local testing.');
    return true;
  }
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(bodyText)
    .digest('hex');

  return signature === expectedSignature;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-retell-signature');

    // 1. Cryptographic HMAC verification
    if (!verifyRetellSignature(rawBody, signature)) {
      throw new AppError('Unauthorized: Invalid signature', 401);
    }

    const payload = JSON.parse(rawBody) as Record<string, Json>;
    const eventType = String(payload.event || '');
    
    // Retell payload call details nested in payload.call or payload.data
    const callData = (payload.call || payload.data || {}) as Record<string, Json>;
    const providerAgentId = String(callData.agent_id || '');

    if (!providerAgentId) {
      throw new AppError('Missing provider_agent_id in payload', 400);
    }

    // 2. Map provider_agent_id to user_id to stamp webhook_events immediately
    const db = getSupabaseAdmin();
    const { data: agentData, error: agentError } = await db
      .from('agents')
      .select('id, user_id, business_name, google_sheet_url, phone_numbers(twilio_phone_number)')
      .eq('provider', 'retell')
      .eq('provider_agent_id', providerAgentId)
      .is('deleted_at', null)
      .single();

    if (agentError || !agentData) {
      console.warn(`No active agent found for provider_agent_id: ${providerAgentId}`);
      // Return 200 OK so Retell doesn't continually retry events for deleted/paused agents
      return NextResponse.json({ success: true, message: 'Agent not tracked' });
    }

    const agent = agentData as unknown as WebhookAgent;

    // Extract associated agent phone number safely
    const agentPhoneNumber = agent.phone_numbers?.[0]?.twilio_phone_number || '';

    // Instantiate CallRepository lazily inside request scope to avoid module load failures
    const callRepo = new CallRepository();

    // 3. Persist raw event as 'pending'
    const loggedEvent = await callRepo.saveWebhookEvent({
      userId: agent.user_id,
      provider: 'retell',
      eventType,
      payload,
    });

    console.log(`Saved webhook event ${loggedEvent.id} as pending. Triggering background processing.`);

    // 4. Run processor asynchronously in the background
    processWebhookEvent(
      loggedEvent.id,
      agent.id,
      agent.user_id,
      eventType,
      callData,
      agent.google_sheet_url,
      agent.business_name,
      agentPhoneNumber
    ).catch((err) => {
      console.error(`Deferred webhook processing error for event ${loggedEvent.id}:`, err);
    });

    return NextResponse.json({ success: true, eventId: loggedEvent.id });
  } catch (error) {
    return handleRouteError(error);
  }
}

// Transactional Asynchronous Webhook Processor
async function processWebhookEvent(
  eventId: string,
  agentId: string,
  userId: string,
  eventType: string,
  callData: Record<string, Json>,
  googleSheetUrl?: string,
  businessName?: string,
  agentPhoneNumber?: string
) {
  const callRepo = new CallRepository();
  try {
    // Only process completed calls ('call_ended' or similar final event)
    if (eventType === 'call_ended' || eventType === 'call_completed') {
      const providerCallId = String(callData.call_id || '');
      const transcript = String(callData.transcript || '');
      const durationSeconds = Number(callData.duration_seconds || 0);
      const callerPhone = String(callData.user_phone_number || '');

      // A. Extract Lead Details via Anthropic Provider (Claude)
      let extractedLead = { name: 'Anonymous', phone: 'Not provided', intent: 'Unknown', summary: 'No details.' };
      if (transcript && transcript.trim().length > 0) {
        const anthropicProvider = new AnthropicProvider();
        extractedLead = await anthropicProvider.summarizeLead(transcript);
      }

      // B. Save Call Details to database
      await callRepo.saveCall({
        agentId,
        userId,
        providerCallId,
        callerPhone,
        durationSeconds,
        summary: extractedLead.summary,
        transcript,
      });

      // C. Sync to Google Sheets Web App endpoint dynamically if configured
      if (googleSheetUrl) {
        try {
          await fetch(googleSheetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: extractedLead.name || 'Anonymous',
              phone: callerPhone || extractedLead.phone || 'Not provided',
              intent: extractedLead.intent || 'General Inquiry',
              summary: extractedLead.summary || 'No details.',
              timestamp: new Date().toISOString(),
            }),
          });
          console.log(`Successfully pushed call from ${callerPhone} to Google Sheet Web App.`);
        } catch (sheetsErr) {
          console.error('Google Sheets webhook execution failed:', sheetsErr);
        }
      }

      // F. Missed Call SMS Fallback Routine
      if (durationSeconds > 0 && durationSeconds < 12 && callerPhone && agentPhoneNumber) {
        try {
          const { TwilioProvider } = await import('@/integrations/twilio/twilio.provider');
          const twilio = new TwilioProvider();
          const cleanBusinessName = businessName || 'our team';
          await twilio.sendSMS({
            to: callerPhone,
            from: agentPhoneNumber,
            message: `Hi! We missed your call. Our team will get back to you shortly. — ${cleanBusinessName}`
          });
          console.log(`Successfully dispatched Missed Call SMS Fallback to ${callerPhone}`);
        } catch (smsErr) {
          console.error('Failed to trigger Twilio Missed Call SMS Fallback:', smsErr);
        }
      }

      // E. Increment Multi-Tenant Usage Billing Minutes
      const minutesUsed = durationSeconds / 60;
      const currentPeriod = new Date().toISOString().substring(0, 7); // Format: YYYY-MM (e.g., '2026-06')
      await callRepo.incrementUsageMetrics({
        userId,
        agentId,
        minutes: minutesUsed,
        billingPeriod: currentPeriod,
      });
    }

    // Mark event queue status as successfully processed
    await callRepo.updateWebhookEventStatus(eventId, 'processed');
    console.log(`Webhook event ${eventId} processed successfully.`);
  } catch (error) {
    console.error(`Error processing webhook event ${eventId}:`, error);
    await callRepo.updateWebhookEventStatus(eventId, 'failed');
    throw error;
  }
}
