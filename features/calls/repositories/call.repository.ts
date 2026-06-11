import { getSupabaseAdmin } from '@/shared/lib/supabase-client';
import { z } from 'zod';
import { Json } from '@/shared/lib/errors';

export const IncrementUsageMetricsParamsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  agentId: z.string().min(1, 'Agent ID is required'),
  minutes: z.number().nonnegative('Minutes must be non-negative'),
  billingPeriod: z.string().min(1, 'Billing period is required'),
});

export type IncrementUsageMetricsParams = z.infer<typeof IncrementUsageMetricsParamsSchema>;

export interface CreateCallDTO {
  agentId: string;
  userId: string;
  providerCallId: string;
  callerPhone?: string;
  durationSeconds: number;
  summary?: string;
  transcript?: string;
}

export interface CreateLeadDTO {
  agentId: string;
  userId: string;
  name?: string;
  phone?: string;
  intent?: string;
  summary?: string;
}

export interface CreateWebhookEventDTO {
  userId?: string;
  provider: string;
  eventType: string;
  payload: Record<string, Json>;
}

export interface Call {
  id: string;
  agent_id: string;
  user_id: string;
  provider_call_id: string;
  caller_phone: string;
  duration_seconds: number;
  summary: string;
  transcript: string;
  created_at: string;
}

export interface Lead {
  id: string;
  agent_id: string;
  user_id: string;
  name: string;
  phone: string;
  intent: string;
  summary: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  user_id: string | null;
  provider: string;
  event_type: string;
  payload: Record<string, Json>;
  status: 'pending' | 'processed' | 'failed';
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export class CallRepository {
  private get db() {
    return getSupabaseAdmin();
  }

  async saveCall(call: CreateCallDTO): Promise<Call> {
    const { data, error } = await this.db
      .from('calls')
      .insert({
        agent_id: call.agentId,
        user_id: call.userId,
        provider_call_id: call.providerCallId,
        caller_phone: call.callerPhone,
        duration_seconds: call.durationSeconds,
        summary: call.summary,
        transcript: call.transcript,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error saving call: ${error.message}`);
    }
    return data as Call;
  }

  async saveLead(lead: CreateLeadDTO): Promise<Lead> {
    const { data, error } = await this.db
      .from('leads')
      .insert({
        agent_id: lead.agentId,
        user_id: lead.userId,
        name: lead.name,
        phone: lead.phone,
        intent: lead.intent,
        summary: lead.summary,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error saving lead: ${error.message}`);
    }
    return data as Lead;
  }

  async saveWebhookEvent(event: CreateWebhookEventDTO): Promise<WebhookEvent> {
    const { data, error } = await this.db
      .from('webhook_events')
      .insert({
        user_id: event.userId,
        provider: event.provider,
        event_type: event.eventType,
        payload: event.payload,
        status: 'pending',
        retry_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error saving webhook event: ${error.message}`);
    }
    return data as WebhookEvent;
  }

  async getPendingWebhookEvents(): Promise<WebhookEvent[]> {
    const { data, error } = await this.db
      .from('webhook_events')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      throw new Error(`Database error fetching pending webhook events: ${error.message}`);
    }
    return (data || []) as WebhookEvent[];
  }

  async updateWebhookEventStatus(id: string, status: 'processed' | 'failed', retryCount?: number): Promise<void> {
    const updatePayload: Record<string, Json> = { status };
    if (retryCount !== undefined) {
      updatePayload.retry_count = retryCount;
    }

    const { error } = await this.db
      .from('webhook_events')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      throw new Error(`Database error updating webhook event status: ${error.message}`);
    }
  }

  async incrementUsageMetrics(params: IncrementUsageMetricsParams): Promise<void> {
    const validated = IncrementUsageMetricsParamsSchema.parse(params);
    const { userId, agentId, minutes, billingPeriod } = validated;

    // Attempt upsert usage_metrics
    const { data: existingMetric, error: fetchError } = await this.db
      .from('usage_metrics')
      .select('*')
      .eq('agent_id', agentId)
      .eq('billing_period', billingPeriod)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Database error fetching usage metric: ${fetchError.message}`);
    }

    if (existingMetric) {
      const { error: updateError } = await this.db
        .from('usage_metrics')
        .update({
          minutes_used: Number(existingMetric.minutes_used) + minutes,
          calls_count: existingMetric.calls_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingMetric.id);

      if (updateError) {
        throw new Error(`Database error updating usage metrics: ${updateError.message}`);
      }
    } else {
      const { error: insertError } = await this.db
        .from('usage_metrics')
        .insert({
          user_id: userId,
          agent_id: agentId,
          minutes_used: minutes,
          calls_count: 1,
          billing_period: billingPeriod,
        });

      if (insertError) {
        throw new Error(`Database error creating usage metrics: ${insertError.message}`);
      }
    }
  }
}
