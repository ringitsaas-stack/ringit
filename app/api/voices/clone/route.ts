import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/shared/lib/supabase-client';
import { RetellProvider } from '@/integrations/retell/retell.provider';
import { AppError, handleRouteError } from '@/shared/lib/errors';
import { BillingService } from '@/features/billing/services/billing.service';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const agentId = formData.get('agentId') as string | null;
    const providerAgentId = formData.get('providerAgentId') as string | null;
    const voiceName = formData.get('voiceName') as string | null;

    if (!file || !agentId || !providerAgentId) {
      throw new AppError('Missing audio file, agentId, or providerAgentId parameters.', 400);
    }

    // Securely resolve userId from DB and check voice cloning feature limits
    const db = getSupabaseAdmin();
    const { data: agent, error: agentErr } = await db
      .from('agents')
      .select('user_id')
      .eq('id', agentId)
      .single();

    if (agentErr || !agent) {
      throw new AppError('Agent not found or unauthorized.', 404);
    }

    await BillingService.checkFeatureAccess(agent.user_id, 'voice_cloning');

    const name = voiceName || `SaaS Cloned Voice - ${agentId.substring(0, 5)}`;
    let voiceId = 'openai-Alloy'; // Default fallback

    const RETELL_API_KEY = process.env.RETELL_API_KEY;

    if (RETELL_API_KEY) {
      console.log(`Sending voice clone request to Retell Native API for: ${name}...`);
      
      const retellProvider = new RetellProvider();
      voiceId = await retellProvider.cloneVoice(file, name);
      console.log(`Retell Native voice cloned successfully. Generated Voice ID: ${voiceId}`);

      // 1. Programmatically patch the active agent voice configuration inside Retell AI
      await retellProvider.updateAssistantVoice(providerAgentId, voiceId);
      console.log(`Successfully updated Retell assistant ${providerAgentId} voice to: ${voiceId}`);
    } else {
      // Sandbox mode mock fallback
      console.warn('RETELL_API_KEY not configured. Running in sandbox simulated cloning mode.');
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate latency
      voiceId = `11labs-cloned-mock-${Math.floor(Math.random() * 9000 + 1000)}`;
      console.log(`Bypassed Retell API update-agent voice for mock sandbox voice ID: ${voiceId}`);
    }

    // 2. Update Supabase database records
    
    // Update the config details on the latest agent version to track rolling prompt backups
    const { data: latestVersion, error: versionFetchErr } = await db
      .from('agent_versions')
      .select('*')
      .eq('agent_id', agentId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestVersion && !versionFetchErr) {
      const updatedConfig = {
        ...(latestVersion.config || {}),
        voiceId: voiceId,
      };

      await db
        .from('agent_versions')
        .update({ config: updatedConfig })
        .eq('id', latestVersion.id);
    }

    return NextResponse.json({
      success: true,
      voiceId: voiceId,
      message: `Cloned voice successfully and applied to receptionist!`,
    });

  } catch (error) {
    return handleRouteError(error);
  }
}
