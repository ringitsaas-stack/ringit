import { getSupabaseAdmin } from '@/shared/lib/supabase-client';
import { AppError } from '@/shared/lib/errors';

export interface SubscriptionContext {
  plan: 'starter' | 'pro' | 'agency';
  status: string;
  max_agents: number;
  max_minutes: number;
  max_users: number;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
}

export class BillingService {
  /**
   * Retrieves the current user subscription plan and associated limits.
   * If no subscription exists in the database, falls back to the default 'starter' tier.
   */
  static async getSubscriptionContext(userId: string): Promise<SubscriptionContext> {
    const db = getSupabaseAdmin();

    const { data: subscription, error } = await db
      .from('subscriptions')
      .select('*, plan_limits(*)')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching subscription for user ${userId}:`, error.message);
    }

    // Default Starter plan limits if no record found
    const defaultStarter: SubscriptionContext = {
      plan: 'starter',
      status: 'active',
      max_agents: 1,
      max_minutes: 100,
      max_users: 1,
      stripe_customer_id: null,
      stripe_subscription_id: null,
    };

    if (!subscription) {
      return defaultStarter;
    }

    const limits = subscription.plan_limits;
    return {
      plan: (subscription.plan || 'starter') as 'starter' | 'pro' | 'agency',
      status: subscription.status || 'active',
      max_agents: limits?.max_agents ?? 1,
      max_minutes: limits?.max_minutes ?? 100,
      max_users: limits?.max_users ?? 1,
      stripe_customer_id: subscription.stripe_customer_id,
      stripe_subscription_id: subscription.stripe_subscription_id,
    };
  }

  /**
   * Checks if the user is allowed to create another agent.
   * Throws a 403 Forbidden error if agent limit is reached.
   */
  static async checkAgentLimit(userId: string): Promise<void> {
    const context = await this.getSubscriptionContext(userId);
    const db = getSupabaseAdmin();

    const { count, error } = await db
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) {
      throw new AppError(`Database error checking agent limit: ${error.message}`, 500);
    }

    const activeCount = count ?? 0;
    if (activeCount >= context.max_agents) {
      throw new AppError(
        `Plan limit reached. Your subscription plan (${context.plan.toUpperCase()}) allows a maximum of ${context.max_agents} active agent(s). Please upgrade to add more.`,
        403
      );
    }
  }

  /**
   * Checks if the user has remaining call minutes for the current calendar month.
   * Throws a 403 Forbidden error if monthly minutes limit has been exceeded.
   */
  static async checkMinutesLimit(userId: string): Promise<void> {
    const context = await this.getSubscriptionContext(userId);
    const db = getSupabaseAdmin();

    // Get current calendar period (YYYY-MM format)
    const now = new Date();
    const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { data: usageRecords, error } = await db
      .from('usage_metrics')
      .select('minutes_used')
      .eq('user_id', userId)
      .eq('billing_period', billingPeriod);

    if (error) {
      throw new AppError(`Database error checking call usage: ${error.message}`, 500);
    }

    const totalMinutesUsed = (usageRecords ?? []).reduce(
      (sum, record) => sum + Number(record.minutes_used),
      0
    );

    if (totalMinutesUsed >= context.max_minutes) {
      throw new AppError(
        `Monthly call minutes limit exceeded. Your plan (${context.plan.toUpperCase()}) limit is ${context.max_minutes} minutes, and you have used ${totalMinutesUsed.toFixed(1)} minutes. Please upgrade to continue.`,
        403
      );
    }
  }

  /**
   * Check if a specific feature is unlocked on the user's current subscription plan.
   * Throws a 403 Forbidden error if feature access is denied.
   */
  static async checkFeatureAccess(
    userId: string,
    feature: 'voice_cloning' | 'google_sheets' | 'advanced_llms'
  ): Promise<void> {
    const context = await this.getSubscriptionContext(userId);
    const plan = context.plan;

    if (plan === 'starter') {
      if (feature === 'voice_cloning') {
        throw new AppError(
          'Custom Voice Cloning is a premium feature. Please upgrade to Pro or Agency to clone custom voices.',
          403
        );
      }
      if (feature === 'google_sheets') {
        throw new AppError(
          'Google Sheets / CRM synchronization is a premium feature. Please upgrade to Pro or Agency to sync leads.',
          403
        );
      }
      if (feature === 'advanced_llms') {
        throw new AppError(
          'Advanced intelligence models (GPT-4o, Claude 3.5 Sonnet, Gemini Pro) are restricted to Pro or Agency plans. Please upgrade to gain full access.',
          403
        );
      }
    }
  }
}
