import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/shared/lib/env';
import { AppError, handleRouteError } from '@/shared/lib/errors';
import { getSupabaseAdmin } from '@/shared/lib/supabase-client';

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId, successUrl, cancelUrl } = await req.json();

    if (!priceId || !userId) {
      throw new AppError('priceId and userId are required', 400);
    }

    const db = getSupabaseAdmin();
    
    // Resolve profile details for email pre-fill
    const { data: profile } = await db
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    const customerEmail = profile?.email;

    if (!env.STRIPE_SECRET_KEY) {
      throw new AppError('Billing checkout is temporarily unavailable. Please contact support.', 503);
    }

    // Determine the target subscription plan from Stripe price configuration
    let plan = 'starter';
    if (
      priceId === env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 
      priceId === env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY
    ) {
      plan = 'pro';
    } else if (
      priceId === env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_MONTHLY || 
      priceId === env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_YEARLY
    ) {
      plan = 'agency';
    }

    // Retrieve existing stripe customer ID to avoid duplicates
    const { data: subscription } = await db
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    const stripeCustomerId = subscription?.stripe_customer_id || undefined;

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15' as any,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : customerEmail,
      client_reference_id: userId,
      success_url: successUrl || `${new URL(req.url).origin}/dashboard?upgrade_success=true`,
      cancel_url: cancelUrl || `${new URL(req.url).origin}/pricing`,
      subscription_data: {
        metadata: {
          userId,
          plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    return handleRouteError(error);
  }
}
