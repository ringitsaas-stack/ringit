import { IRetellProvider, AssistantDetails, RegisterPhoneDetails, CreateAssistantParams, CreateAssistantParamsSchema, UpdateAssistantParams, UpdateAssistantParamsSchema } from './retell.interface';
import Retell, { toFile } from 'retell-sdk';

export class RetellProvider implements IRetellProvider {
  private apiKey: string;
  private client: Retell;
  private baseUrl = 'https://api.retellai.com';

  constructor() {
    const apiKey = process.env.RETELL_API_KEY;
    if (!apiKey) {
      throw new Error('Missing RETELL_API_KEY environment variable.');
    }
    this.apiKey = apiKey;
    this.client = new Retell({ apiKey: this.apiKey });
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async createAssistant(params: CreateAssistantParams): Promise<AssistantDetails> {
    try {
      const validated = CreateAssistantParamsSchema.parse(params);
      const { name, prompt, voiceId } = validated;

      // 1. Create Retell LLM response engine first
      const llmResponse = await fetch(`${this.baseUrl}/create-retell-llm`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          general_prompt: prompt,
        }),
      });

      if (!llmResponse.ok) {
        const errorText = await llmResponse.text();
        throw new Error(`Retell LLM creation failed: ${llmResponse.status} - ${errorText}`);
      }

      const llmData = await llmResponse.json();
      const llmId = llmData.llm_id;

      // 2. Create the Voice Agent linked to this LLM
      const agentResponse = await fetch(`${this.baseUrl}/create-agent`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          agent_name: name,
          voice_id: voiceId,
          response_engine: {
            type: 'retell-llm',
            llm_id: llmId,
          },
        }),
      });

      if (!agentResponse.ok) {
        const errorText = await agentResponse.text();
        // Cleanup LLM if agent creation failed
        await fetch(`${this.baseUrl}/delete-retell-llm/${llmId}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
        }).catch(() => {});
        
        throw new Error(`Retell Agent creation failed: ${agentResponse.status} - ${errorText}`);
      }

      const agentData = await agentResponse.json();
      return {
        providerAgentId: agentData.agent_id,
      };
    } catch (error) {
      console.error('Retell createAssistant error:', error);
      throw error;
    }
  }

  async updateAssistant(params: UpdateAssistantParams): Promise<void> {
    try {
      const validated = UpdateAssistantParamsSchema.parse(params);
      const { providerAgentId, prompt, model } = validated;

      // 1. Fetch agent details to get associated llm_id
      const agentResponse = await fetch(`${this.baseUrl}/get-agent/${providerAgentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
 
      if (!agentResponse.ok) {
        const errorText = await agentResponse.text();
        throw new Error(`Failed to retrieve agent details: ${agentResponse.status} - ${errorText}`);
      }
 
      const agentData = await agentResponse.json();
      const llmId = agentData.response_engine?.llm_id;
 
      if (!llmId) {
        throw new Error(`No associated LLM found for agent: ${providerAgentId}`);
      }
 
      // 2. Update the Retell LLM response engine properties
      const updatePayload: { general_prompt?: string; model?: string } = {};
      if (prompt) updatePayload.general_prompt = prompt;
      if (model) updatePayload.model = model;
 
      const llmUpdateResponse = await fetch(`${this.baseUrl}/update-retell-llm/${llmId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updatePayload),
      });
 
      if (!llmUpdateResponse.ok) {
        const errorText = await llmUpdateResponse.text();
        throw new Error(`Failed to update Retell LLM: ${llmUpdateResponse.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Retell updateAssistant error:', error);
      throw error;
    }
  }

  async deleteAssistant(providerAgentId: string): Promise<void> {
    try {
      // 1. Fetch agent details to get associated llm_id for cleanup
      const agentResponse = await fetch(`${this.baseUrl}/get-agent/${providerAgentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      }).catch(() => null);

      let llmId = null;
      if (agentResponse && agentResponse.ok) {
        const agentData = await agentResponse.json();
        llmId = agentData.response_engine?.llm_id;
      }

      // 2. Delete the Voice Agent
      const deleteAgentResponse = await fetch(`${this.baseUrl}/delete-agent/${providerAgentId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!deleteAgentResponse.ok) {
        const errorText = await deleteAgentResponse.text();
        throw new Error(`Retell API error delete-agent: ${deleteAgentResponse.status} - ${errorText}`);
      }

      // 3. Delete the associated Retell LLM response engine
      if (llmId) {
        await fetch(`${this.baseUrl}/delete-retell-llm/${llmId}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
        }).catch((err) => console.error('Failed to cleanup associated Retell LLM:', err));
      }
    } catch (error) {
      console.error('Retell deleteAssistant error:', error);
      throw error;
    }
  }

  async registerPhoneNumber(phoneNumber: string, providerAgentId: string): Promise<RegisterPhoneDetails> {
    try {
      // Register custom Twilio number in Retell
      const response = await fetch(`${this.baseUrl}/create-phone-number`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          phone_number: phoneNumber,
          inbound_agents: [{ agent_id: providerAgentId, weight: 1 }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Retell API error create-phone-number: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return {
        providerPhoneId: data.phone_number || data.phone_number_sid || phoneNumber,
      };
    } catch (error) {
      console.error('Retell registerPhoneNumber error:', error);
      throw error;
    }
  }

  async updateAssistantVoice(providerAgentId: string, voiceId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/update-agent/${providerAgentId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          voice_id: voiceId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Retell API error update-agent voice: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Retell updateAssistantVoice error:', error);
      throw error;
    }
  }

  async cloneVoice(file: File, voiceName: string): Promise<string> {
    try {
      // Use raw fetch multipart to bypass SDK serialization issues and get real error messages
      const buffer = Buffer.from(await file.arrayBuffer());
      const blob = new Blob([buffer], { type: file.type || 'audio/wav' });

      const form = new FormData();
      form.append('files', blob, file.name || 'sample.wav');
      form.append('voice_name', voiceName);
      form.append('voice_provider', 'elevenlabs');

      const response = await fetch(`${this.baseUrl}/clone-voice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          // Do NOT set Content-Type — let fetch set it with the correct boundary
        },
        body: form,
      });

      const responseText = await response.text();
      console.log(`Retell cloneVoice raw response [${response.status}]:`, responseText);

      if (!response.ok) {
        throw new Error(`Retell voice clone failed: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText) as { voice_id: string };
      return data.voice_id;
    } catch (error) {
      console.error('Retell cloneVoice error:', error);
      throw error;
    }
  }
}
