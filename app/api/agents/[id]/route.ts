import { NextRequest, NextResponse } from 'next/server';
import { AgentRepository } from '@/features/agents/repositories/agent.repository';
import { RetellProvider } from '@/integrations/retell/retell.provider';
import { TwilioProvider } from '@/integrations/twilio/twilio.provider';
import { getSupabaseAdmin } from '@/shared/lib/supabase-client';
import { AppError, handleRouteError } from '@/shared/lib/errors';
import { BillingService } from '@/features/billing/services/billing.service';

const agentRepo = new AgentRepository();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const agent = await agentRepo.getAgentById(id);
    if (!agent) {
      throw new AppError('Agent not found', 404);
    }
    return NextResponse.json({ success: true, agent });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { businessName, services, tone, leadEmail, status, prompt, llmModel, language, voiceId, googleSheetUrl } = body;

    // Retrieve the existing agent to get provider details
    const agent = await agentRepo.getAgentById(id);
    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    const userId = agent.user_id;

    // Securely check feature restrictions
    if (googleSheetUrl && googleSheetUrl !== agent.google_sheet_url) {
      await BillingService.checkFeatureAccess(userId, 'google_sheets');
    }

    if (llmModel && llmModel !== 'gpt-4o-mini') {
      await BillingService.checkFeatureAccess(userId, 'advanced_llms');
    }

    const db = getSupabaseAdmin();
    const updatePayload: {
      updated_at: string;
      business_name?: string;
      services?: string;
      tone?: string;
      lead_email?: string;
      status?: string;
      google_sheet_url?: string;
    } = { updated_at: new Date().toISOString() };

    if (businessName) updatePayload.business_name = businessName;
    if (services) updatePayload.services = services;
    if (tone) updatePayload.tone = tone;
    if (leadEmail) updatePayload.lead_email = leadEmail;
    if (status) updatePayload.status = status;
    if (googleSheetUrl !== undefined) updatePayload.google_sheet_url = googleSheetUrl;

    // Update database record
    const { data: updatedAgent, error: dbError } = await db
      .from('agents')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (dbError) {
      throw new AppError(`Failed to update agent database: ${dbError.message}`, 500);
    }

    // Dynamically patch parameters inside Retell AI
    if (agent.provider === 'retell') {
      const retellProvider = new RetellProvider();
      
      if (prompt || llmModel) {
        await retellProvider.updateAssistant({
          providerAgentId: agent.provider_agent_id,
          prompt,
          model: llmModel,
        });
      }
      
      if (voiceId) {
        await retellProvider.updateAssistantVoice(agent.provider_agent_id, voiceId);

        // Persist voiceId to latest agent_version config so it survives page reloads
        const { data: latestVersion } = await db
          .from('agent_versions')
          .select('id, config')
          .eq('agent_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestVersion) {
          await db
            .from('agent_versions')
            .update({ config: { ...(latestVersion.config ?? {}), voiceId } })
            .eq('id', latestVersion.id);
        }
      }

      // Create new prompt version history log
      if (prompt) {
        await agentRepo.saveAgentVersion({
          agentId: id,
          prompt: prompt,
          config: {
            voiceId: voiceId || agent.phone_numbers?.[0]?.provider_phone_id || 'openai-Alloy',
            tone: tone || agent.tone,
            services: services || agent.services,
            leadEmail: leadEmail || agent.lead_email,
            llmModel: llmModel || 'gpt-4o-mini',
            language: language || 'English (US)',
          },
          createdBy: agent.user_id,
        });
      }
    }

    return NextResponse.json({ success: true, agent: updatedAgent });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const agent = await agentRepo.getAgentById(id);
    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    // 1. Delete assistant from Retell AI
    if (agent.provider === 'retell') {
      try {
        const retellProvider = new RetellProvider();
        await retellProvider.deleteAssistant(agent.provider_agent_id);
      } catch (err) {
        console.error('Failed to delete Retell AI assistant during rollback:', err);
      }
    }

    // 2. Release phone number on Twilio if associated
    const db = getSupabaseAdmin();
    const { data: phoneDetails } = await db
      .from('phone_numbers')
      .select('*')
      .eq('agent_id', id)
      .single();

    if (phoneDetails) {
      try {
        const twilioProvider = new TwilioProvider();
        // Point Twilio webhook away from Retell voice routing back to empty routing
        await twilioProvider.configureVoiceWebhook(phoneDetails.twilio_phone_sid, '');
      } catch (err) {
        console.error('Failed to configure Twilio webhook during rollback:', err);
      }
    }

    // 3. Trigger soft delete database mutation
    await agentRepo.softDeleteAgent(id);

    return NextResponse.json({ success: true, message: 'Agent soft deleted successfully' });
  } catch (error) {
    return handleRouteError(error);
  }
}
