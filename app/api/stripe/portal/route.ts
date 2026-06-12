import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/shared/lib/env';
import { AppError, handleRouteError } from '@/shared/lib/errors';
import { getSupabaseAdmin } from '@/shared/lib/supabase-client';

export async function POST(req: NextRequest) {
  try {
    const { userId, returnUrl } = await req.json();

    if (!userId) {
      throw new AppError('userId is required', 400);
    }

    const db = getSupabaseAdmin();

    // Retrieve existing stripe customer ID
    const { data: subscription } = await db
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    const stripeCustomerId = subscription?.stripe_customer_id;

    if (!stripeCustomerId) {
      throw new AppError('No active Stripe customer found. Please subscribe to a plan first.', 400);
    }

    if (!env.STRIPE_SECRET_KEY) {
      throw new AppError('Billing portal is temporarily unavailable.', 503);
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15' as any,
    });

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl || `${new URL(req.url).origin}/dashboard`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    return handleRouteError(error);
  }
}
