import { getSupabaseAdmin } from '@/shared/lib/supabase-client';

export interface CreateAgentDTO {
  userId: string;
  businessName: string;
  industry: string;
  tone?: string;
  services?: string;
  leadEmail: string;
  provider: string;
  providerAgentId: string;
  googleSheetUrl?: string;
}

export interface CreatePhoneDTO {
  userId: string;
  agentId: string | null;
  twilioPhoneNumber: string;
  twilioPhoneSid: string;
  providerPhoneId?: string;
}

export interface AgentVersionConfig {
  voiceId: string;
  tone?: string;
  services?: string;
  leadEmail?: string;
  llmModel?: string;
  language?: string;
}

export interface CreateVersionDTO {
  agentId: string;
  prompt: string;
  config: AgentVersionConfig;
  createdBy: string;
}

export interface Agent {
  id: string;
  user_id: string;
  business_name: string;
  industry: string;
  tone: string;
  services: string;
  lead_email: string;
  provider: string;
  provider_agent_id: string;
  status: 'active' | 'paused' | 'cancelled';
  google_sheet_url: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  phone_numbers?: PhoneNumber[];
}

export interface PhoneNumber {
  id: string;
  user_id: string;
  agent_id: string | null;
  twilio_phone_number: string;
  twilio_phone_sid: string;
  provider_phone_id?: string;
  status: 'active' | 'released';
  created_at: string;
  updated_at: string;
}

export interface AgentVersion {
  id: string;
  agent_id: string;
  version: number;
  prompt: string;
  config: AgentVersionConfig;
  created_by: string;
  created_at: string;
}

export class AgentRepository {
  private get db() {
    return getSupabaseAdmin();
  }

  async saveAgent(agent: CreateAgentDTO): Promise<Agent> {
    const { data, error } = await this.db
      .from('agents')
      .insert({
        user_id: agent.userId,
        business_name: agent.businessName,
        industry: agent.industry,
        tone: agent.tone,
        services: agent.services,
        lead_email: agent.leadEmail,
        provider: agent.provider,
        provider_agent_id: agent.providerAgentId,
        status: 'active',
        google_sheet_url: agent.googleSheetUrl || '',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error saving agent: ${error.message}`);
    }
    return data as Agent;
  }

  async savePhoneNumber(phone: CreatePhoneDTO): Promise<PhoneNumber> {
    const { data, error } = await this.db
      .from('phone_numbers')
      .insert({
        user_id: phone.userId,
        agent_id: phone.agentId,
        twilio_phone_number: phone.twilioPhoneNumber,
        twilio_phone_sid: phone.twilioPhoneSid,
        provider_phone_id: phone.providerPhoneId,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error saving phone number: ${error.message}`);
    }
    return data as PhoneNumber;
  }

  async saveAgentVersion(version: CreateVersionDTO): Promise<AgentVersion> {
    const { data, error } = await this.db
      .from('agent_versions')
      .insert({
        agent_id: version.agentId,
        prompt: version.prompt,
        config: version.config,
        created_by: version.createdBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error saving agent version: ${error.message}`);
    }
    return data as AgentVersion;
  }

  async getAgentById(id: string): Promise<Agent | null> {
    const { data, error } = await this.db
      .from('agents')
      .select('*, phone_numbers(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      return null;
    }
    return data as Agent;
  }

  async updateAgentStatus(id: string, status: 'active' | 'paused' | 'cancelled'): Promise<void> {
    const { error } = await this.db
      .from('agents')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Database error updating agent status: ${error.message}`);
    }
  }

  async softDeleteAgent(id: string): Promise<void> {
    const now = new Date().toISOString();
    
    // Soft delete the agent
    const { error: agentError } = await this.db
      .from('agents')
      .update({ deleted_at: now, updated_at: now })
      .eq('id', id);

    if (agentError) {
      throw new Error(`Database error soft deleting agent: ${agentError.message}`);
    }

    // Release associated phone numbers
    const { error: phoneError } = await this.db
      .from('phone_numbers')
      .update({ status: 'released' })
      .eq('agent_id', id);

    if (phoneError) {
      throw new Error(`Database error releasing associated phone numbers: ${phoneError.message}`);
    }
  }
}
