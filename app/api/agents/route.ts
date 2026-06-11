import { NextRequest, NextResponse } from 'next/server';
import { AgentProvisionService } from '@/features/agents/services/agent-provision.service';
import { getSupabaseAdmin } from '@/shared/lib/supabase-client';
import { AppError, handleRouteError } from '@/shared/lib/errors';
import { BillingService } from '@/features/billing/services/billing.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      throw new AppError('Missing userId parameter', 400);
    }

    const db = getSupabaseAdmin();
    const { data: agents, error } = await db
      .from('agents')
      .select('*, phone_numbers(*)')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(`Database error fetching agents list: ${error.message}`, 500);
    }

    // Enrich each agent with its latest version config (voiceId, llmModel, language, etc.)
    const enriched = await Promise.all(
      (agents ?? []).map(async (agent) => {
        const { data: latestVersion } = await db
          .from('agent_versions')
          .select('config')
          .eq('agent_id', agent.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        return { ...agent, latest_config: latestVersion?.config ?? null };
      })
    );

    return NextResponse.json({ success: true, agents: enriched });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      userId, 
      businessName, 
      industry, 
      tone, 
      services, 
      leadEmail, 
      countryCode,
      areaCode,
      existingPhoneNumber,
      existingPhoneSid,
      googleSheetUrl
    } = body;

    if (!userId || !businessName || !industry || !leadEmail) {
      throw new AppError('Missing required onboarding parameters', 400);
    }

    // Secure database limits check
    await BillingService.checkAgentLimit(userId);
    await BillingService.checkMinutesLimit(userId);

    // Secure database feature restriction check
    if (googleSheetUrl) {
      await BillingService.checkFeatureAccess(userId, 'google_sheets');
    }

    const provisionService = new AgentProvisionService();
    const result = await provisionService.provisionAgent({
      userId,
      businessName,
      industry,
      tone: tone || 'Warm and friendly',
      services: services || '',
      leadEmail,
      countryCode: countryCode || 'US',
      areaCode,
      existingPhoneNumber,
      existingPhoneSid,
      googleSheetUrl,
    });

    return NextResponse.json({ 
      success: true, 
      agent: {
        id: result.agentId,
        provider_agent_id: result.providerAgentId,
      },
      phone: {
        twilio_phone_number: result.phoneNumber,
      },
      agentId: result.agentId,
      phoneNumber: result.phoneNumber,
      providerAgentId: result.providerAgentId,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
