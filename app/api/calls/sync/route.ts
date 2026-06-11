import { NextRequest, NextResponse } from 'next/server';
import { CallRepository } from '@/features/calls/repositories/call.repository';
import { getSupabaseAdmin } from '@/shared/lib/supabase-client';
import { AnthropicProvider } from '@/integrations/anthropic/anthropic.provider';
import { AppError, handleRouteError } from '@/shared/lib/errors';

interface SyncedAgent {
  id: string;
  user_id: string;
  provider_agent_id: string;
  business_name: string;
  google_sheet_url: string;
  phone_numbers: { twilio_phone_number: string }[] | null;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      throw new AppError('Missing userId in request body', 400);
    }

    const db = getSupabaseAdmin();
    
    // 1. Fetch active agents for the user
    const { data: agentsData, error: agentsError } = await db
      .from('agents')
      .select('id, user_id, provider_agent_id, business_name, google_sheet_url, phone_numbers(twilio_phone_number)')
      .eq('user_id', userId)
      .eq('provider', 'retell')
      .is('deleted_at', null);

    if (agentsError) {
      throw new AppError(`Failed to fetch agents: ${agentsError.message}`, 500);
    }

    if (!agentsData || agentsData.length === 0) {
      return NextResponse.json({ success: true, syncedCount: 0, message: 'No active Retell agents found' });
    }

    const agents = agentsData as unknown as SyncedAgent[];

    const apiKey = process.env.RETELL_API_KEY;
    if (!apiKey) {
      throw new AppError('RETELL_API_KEY environment variable is not configured', 500);
    }

    const callRepo = new CallRepository();
    let totalSynced = 0;

    // 2. Sync calls for each agent
    for (const agent of agents) {
      const providerAgentId = agent.provider_agent_id;

      // Call Retell list-calls API (Migrated to v3 as per deprecation notice)
      const retellRes = await fetch('https://api.retellai.com/v3/list-calls', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter_criteria: {
            agent_id: [providerAgentId],
          },
        }),
      });

      if (!retellRes.ok) {
        console.error(`Retell API error list-calls for agent ${providerAgentId}: ${retellRes.status}`);
        continue;
      }

      const resData = await retellRes.json();
      
      // Explicit type checking for items array to avoid any
      const items = resData && typeof resData === 'object' 
        ? (Array.isArray(resData) ? resData : (resData.items || resData.calls || resData.data || []))
        : [];
      
      const retellCalls = Array.isArray(items) ? items : [];

      for (const callDataObj of retellCalls) {
        if (!callDataObj || typeof callDataObj !== 'object') continue;
        const callData = callDataObj as Record<string, any>; // Since external API data is arbitrary, parsing fields explicitly:
        const providerCallId = callData.call_id;
        if (!providerCallId) continue;

        // Check if call already exists in Supabase
        const { data: existingCall } = await db
          .from('calls')
          .select('id')
          .eq('provider_call_id', providerCallId)
          .maybeSingle();

        if (existingCall) {
          continue; // Already saved
        }

        // Call is new! Let's process it exactly like our webhook
        const transcript = callData.transcript || '';
        const durationSeconds = Math.round((callData.duration_ms || 0) / 1000);
        const callerPhone = callData.from_number || '';

        // Extract Lead details (with robust fallback in case Anthropic API key is default/invalid)
        let extractedLead = { 
          name: 'Anonymous', 
          phone: 'Not provided', 
          intent: 'Unknown', 
          summary: callData.call_analysis?.call_summary || 'No details.' 
        };

        if (transcript && transcript.trim().length > 0) {
          try {
            const hasValidKey = process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('youranthropicapikey');
            if (hasValidKey) {
              const anthropicProvider = new AnthropicProvider();
              extractedLead = await anthropicProvider.summarizeLead(transcript);
            } else {
              // Fallback Regex Parser for local development
              console.log('Bypassing Claude: Using regex/fallback extractor for local development.');
              const regexLead = fallbackLeadExtractor(transcript);
              extractedLead = {
                name: regexLead.name,
                phone: regexLead.phone,
                intent: regexLead.intent,
                summary: callData.call_analysis?.call_summary || regexLead.summary
              };
            }
          } catch (e) {
            console.error('Claude lead extraction failed, using local fallback:', e);
            const regexLead = fallbackLeadExtractor(transcript);
            extractedLead = {
              name: regexLead.name,
              phone: regexLead.phone,
              intent: regexLead.intent,
              summary: callData.call_analysis?.call_summary || regexLead.summary
            };
          }
        }

        // Save Call details
        await callRepo.saveCall({
          agentId: agent.id,
          userId: agent.user_id,
          providerCallId,
          callerPhone,
          durationSeconds,
          summary: extractedLead.summary,
          transcript,
        });

        // Save Lead record
        if (extractedLead.name !== 'Anonymous' || extractedLead.phone !== 'Not provided') {
          await callRepo.saveLead({
            agentId: agent.id,
            userId: agent.user_id,
            name: extractedLead.name,
            phone: extractedLead.phone,
            intent: extractedLead.intent,
            summary: extractedLead.summary,
          });

          // Sync to Google Sheets if configured
          if (agent.google_sheet_url) {
            try {
              await fetch(agent.google_sheet_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: extractedLead.name,
                  phone: extractedLead.phone,
                  intent: extractedLead.intent,
                  summary: extractedLead.summary,
                  timestamp: new Date().toISOString(),
                }),
              });
            } catch (sheetsErr) {
              console.error('Google Sheets sync execution failed:', sheetsErr);
            }
          }
        }

        // Increment Multi-Tenant Usage Billing Minutes
        const minutesUsed = durationSeconds / 60;
        const currentPeriod = new Date().toISOString().substring(0, 7); // Format: YYYY-MM
        await callRepo.incrementUsageMetrics({
          userId: agent.user_id,
          agentId: agent.id,
          minutes: minutesUsed,
          billingPeriod: currentPeriod,
        });

        totalSynced++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      syncedCount: totalSynced, 
      message: `Successfully synced ${totalSynced} calls from Retell AI` 
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

// Simple deterministic fallback parser for transcripts
function fallbackLeadExtractor(transcript: string) {
  const lowercase = transcript.toLowerCase();
  
  // Basic Regex parsers
  let name = 'Unknown';
  let phone = 'Not provided';
  let intent = 'General Inquiry';
  
  // Try extracting Name
  const nameMatch = transcript.match(/(?:my name is|this is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (nameMatch && nameMatch[1]) {
    name = nameMatch[1];
  }

  // Try extracting Phone Number
  const phoneMatch = transcript.match(/(\+?\d{1,4}[-.\s]??\(?\d{1,3}?\)?[-.\s]??\d{1,4}[-.\s]??\d{1,4}[-.\s]??\d{1,9})/);
  if (phoneMatch && phoneMatch[1]) {
    phone = phoneMatch[1];
  }

  // Identify common booking intents
  if (lowercase.includes('pizza') || lowercase.includes('order') || lowercase.includes('cheese') || lowercase.includes('pepperoni')) {
    intent = 'Order a pizza';
  } else if (lowercase.includes('appointment') || lowercase.includes('book') || lowercase.includes('schedule')) {
    intent = 'Schedule appointment';
  }

  // Generate a basic summary
  const summary = `Lead contact ${name} (${phone}) spoke with reception regarding ${intent}.`;

  return { name, phone, intent, summary };
}
