import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/shared/lib/supabase-client';
import { AppError, handleRouteError } from '@/shared/lib/errors';
import { BillingService } from '@/features/billing/services/billing.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      throw new AppError('userId parameter is required', 400);
    }

    const db = getSupabaseAdmin();
    const context = await BillingService.getSubscriptionContext(userId);

    // 1. Query active agents count
    const { count: agentsCount, error: agentsErr } = await db
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (agentsErr) {
      throw new AppError(`Database error counting agents: ${agentsErr.message}`, 500);
    }

    // 2. Query monthly minutes used
    const now = new Date();
    const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { data: usageRecords, error: usageErr } = await db
      .from('usage_metrics')
      .select('minutes_used')
      .eq('user_id', userId)
      .eq('billing_period', billingPeriod);

    if (usageErr) {
      throw new AppError(`Database error retrieving usage metrics: ${usageErr.message}`, 500);
    }

    const totalMinutesUsed = (usageRecords ?? []).reduce(
      (sum, record) => sum + Number(record.minutes_used),
      0
    );

    // 3. Query lifetime minutes used from call logs
    const { data: callsData, error: callsErr } = await db
      .from('calls')
      .select('duration_seconds')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (callsErr) {
      throw new AppError(`Database error retrieving lifetime calls: ${callsErr.message}`, 500);
    }

    const lifetimeSeconds = (callsData ?? []).reduce(
      (sum, record) => sum + (record.duration_seconds || 0),
      0
    );
    const lifetimeMinutes = Number((lifetimeSeconds / 60).toFixed(1));

    return NextResponse.json({
      success: true,
      subscription: {
        plan: context.plan,
        status: context.status,
        max_agents: context.max_agents,
        max_minutes: context.max_minutes,
        stripe_customer_id: context.stripe_customer_id,
        stripe_subscription_id: context.stripe_subscription_id,
      },
      usage: {
        agents_count: agentsCount || 0,
        minutes_used: Number(totalMinutesUsed.toFixed(1)),
        lifetime_minutes: lifetimeMinutes,
      },
    });

  } catch (error) {
    return handleRouteError(error);
  }
}
