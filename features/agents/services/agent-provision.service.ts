import { AgentRepository, Agent } from '../repositories/agent.repository';
import { TwilioProvider } from '@/integrations/twilio/twilio.provider';
import { RetellProvider } from '@/integrations/retell/retell.provider';
import { getSupabaseAdmin } from '@/shared/lib/supabase-client';
import { AssistantDetails } from '@/integrations/retell/retell.interface';

export interface ProvisionAgentDTO {
  userId: string;
  businessName: string;
  industry: string;
  tone: string;
  services: string;
  leadEmail: string;
  areaCode?: string;
  existingPhoneNumber?: string;
  existingPhoneSid?: string;
  googleSheetUrl?: string;
}

export class AgentProvisionService {
  private agentRepo: AgentRepository;
  private twilioProvider: TwilioProvider;
  private retellProvider: RetellProvider;

  constructor() {
    this.agentRepo = new AgentRepository();
    this.twilioProvider = new TwilioProvider();
    this.retellProvider = new RetellProvider();
  }

  // Pre-configured, high-quality industry prompt templates
  private getIndustryPromptTemplate(dto: ProvisionAgentDTO): string {
    const { businessName, tone, services, leadEmail } = dto;
    const baseTemplates: Record<string, string> = {
      dental: `You are a warm, professional dental clinic receptionist for {businessName}.
Your role:
- Answer calls with a friendly greeting
- Explain services: {services}
- Collect client info: name, phone, Urgency, preferred appointment slot
- Avoid medical diagnosis. Suggest booking an appointment.
Tone: {tone}. Lead summary should be routed to {leadEmail}.`,
      hvac: `You are a helpful, practical dispatch receptionist for {businessName} HVAC services.
Your role:
- Greet: "Thank you for calling {businessName}, how can we help with your heating or cooling today?"
- Assess urgency: Is this an emergency outage (no heat in freezing weather) or routine maintenance?
- Collect details: name, phone, street address, problem description
Tone: {tone}. Lead details will go to {leadEmail}.`,
      legal: `You are a highly professional law firm intake receptionist for {businessName}.
Your role:
- Answer with extreme discretion and professionalism
- Explain service areas: {services}
- Collect: name, phone, brief description of legal inquiry
- WARNING: Never give legal advice. Say "an attorney will speak on that during consultation."
Tone: {tone}. Lead reports will be compiled to {leadEmail}.`,
      salon: `You are a friendly, upbeat salon booking coordinator for {businessName}.
Your role:
- Explain treatments and stylist availability: {services}
- Capture appointment requests: name, phone, desired stylist, service type, time
Tone: {tone}. Booking notifications will be sent to {leadEmail}.`
    };

    const template = baseTemplates[dto.industry.toLowerCase()] || `You are a helpful, friendly receptionist for {businessName}.
Your role:
- Explain services: {services}
- Collect caller's name, phone number, and brief description of inquiry
Tone: {tone}. Summary will be compiled to {leadEmail}.`;

    return template
      .replace(/{businessName}/g, businessName)
      .replace(/{tone}/g, tone)
      .replace(/{services}/g, services)
      .replace(/{leadEmail}/g, leadEmail);
  }

  private getIndustryVoiceMap(industry: string): string {
    const voiceMap: Record<string, string> = {
      dental: 'openai-Alloy',
      hvac: 'openai-Echo',
      legal: 'openai-Shimmer',
      salon: 'openai-Nova'
    };
    return voiceMap[industry.toLowerCase()] || 'openai-Alloy';
  }

  async provisionAgent(dto: ProvisionAgentDTO): Promise<{
    agentId: string;
    phoneNumber: string;
    providerAgentId: string;
  }> {
    const db = getSupabaseAdmin();
    let savedAgent: Agent | null = null;
    let retellAgent: AssistantDetails | null = null;

    // 1. Verify User Subscription Limits
    const { data: subscription, error: subError } = await db
      .from('subscriptions')
      .select('*, plan_limits(*)')
      .eq('user_id', dto.userId)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      throw new Error(`Billing verification failed: ${subError.message}`);
    }

    // Default to a premium limit (20 agents) if no database subscription limit is set yet
    const maxAgents = subscription?.plan_limits?.max_agents ?? 20;

    const { count, error: countError } = await db
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', dto.userId)
      .is('deleted_at', null);

    if (countError) {
      throw new Error(`Failed to query existing agents count: ${countError.message}`);
    }

    if (count !== null && count >= maxAgents) {
      throw new Error(`Plan limit reached. Your subscription plan allows a maximum of ${maxAgents} receptionist agent(s). Please upgrade to add more.`);
    }

    // 2. Generate Prompt and Voice Setup
    const prompt = this.getIndustryPromptTemplate(dto);
    const voiceId = this.getIndustryVoiceMap(dto.industry);

    // 3. Create Retell Assistant
    retellAgent = await this.retellProvider.createAssistant({
      name: `${dto.businessName} Receptionist`,
      prompt,
      voiceId,
    });

    // 4. Procure Twilio Number (or reuse pre-owned Twilio number)
    let twilioDetails;
    if (dto.existingPhoneNumber && dto.existingPhoneSid) {
      twilioDetails = {
        phoneNumber: dto.existingPhoneNumber,
        sid: dto.existingPhoneSid,
      };
      console.log(`Bypassing Twilio purchase. Linking existing Twilio number: ${dto.existingPhoneNumber}`);
    } else {
      const availableNumbers = await this.twilioProvider.searchAvailableNumbers(dto.areaCode);
      if (!availableNumbers.length) {
        // Cleanup retell agent if twilio procurement fails
        await this.retellProvider.deleteAssistant(retellAgent.providerAgentId);
        throw new Error(`No available phone numbers found in area code: ${dto.areaCode || 'US default'}`);
      }

      const selectedNumber = availableNumbers[0].phoneNumber;
      twilioDetails = await this.twilioProvider.purchaseNumber(selectedNumber);
    }

    try {
      // 5. Register Twilio Number inside Retell AI
      let registeredPhone = { providerPhoneId: twilioDetails.phoneNumber };
      try {
        registeredPhone = await this.retellProvider.registerPhoneNumber(
          twilioDetails.phoneNumber,
          retellAgent.providerAgentId
        );
      } catch (phoneRegErr) {
        console.warn('Retell phone registration failed/skipped (proceeding with fallback phone ID):', phoneRegErr);
        // If it's a pre-owned Twilio number, proceed anyway to write all database records successfully
        if (!dto.existingPhoneNumber) {
          throw phoneRegErr;
        }
      }

      // 6. Connect Twilio voice webhook to Retell inbound webhook gateway
      // In production, Retell voice webhook format: https://api.retellai.com/twilio-voice-webhook/<apiKey>
      const retellWebhookUrl = `https://api.retellai.com/twilio-voice-webhook/${process.env.RETELL_API_KEY}`;
      await this.twilioProvider.configureVoiceWebhook(twilioDetails.sid, retellWebhookUrl);

      // 7. Save everything in Supabase
      savedAgent = await this.agentRepo.saveAgent({
        userId: dto.userId,
        businessName: dto.businessName,
        industry: dto.industry,
        tone: dto.tone,
        services: dto.services,
        leadEmail: dto.leadEmail,
        provider: 'retell',
        providerAgentId: retellAgent.providerAgentId,
        googleSheetUrl: dto.googleSheetUrl,
      });

      await this.agentRepo.savePhoneNumber({
        userId: dto.userId,
        agentId: savedAgent.id,
        twilioPhoneNumber: twilioDetails.phoneNumber,
        twilioPhoneSid: twilioDetails.sid,
        providerPhoneId: registeredPhone.providerPhoneId,
      });

      await this.agentRepo.saveAgentVersion({
        agentId: savedAgent.id,
        prompt: prompt,
        config: {
          voiceId,
          tone: dto.tone,
          services: dto.services,
          leadEmail: dto.leadEmail,
        },
        createdBy: dto.userId,
      });

      return {
        agentId: savedAgent.id,
        phoneNumber: twilioDetails.phoneNumber,
        providerAgentId: retellAgent.providerAgentId,
      };

    } catch (error) {
      // Critical cleanup sequence in case of provisioning failure
      console.error('Provisioning failed, running rollback cleanup:', error);
      
      // Rollback Retell Agent
      if (retellAgent?.providerAgentId) {
        try {
          await this.retellProvider.deleteAssistant(retellAgent.providerAgentId);
        } catch (e) {
          console.error('Rollback Retell agent cleanup failed:', e);
        }
      }

      // Rollback Supabase saved agent to maintain database transaction integrity
      if (savedAgent?.id) {
        try {
          console.log(`Rolling back database transaction: deleting orphan agent record ${savedAgent.id}`);
          const db = getSupabaseAdmin();
          await db.from('agents').delete().eq('id', savedAgent.id);
        } catch (dbDelErr) {
          console.error('Rollback Supabase agent deletion failed:', dbDelErr);
        }
      }

      throw error;
    }
  }
}
