import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/shared/lib/env';
import { getSupabaseAdmin } from '@/shared/lib/supabase-client';

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] Missing configuration environment variables.');
    return NextResponse.json({ error: 'Stripe webhook configurations missing' }, { status: 500 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15' as any,
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(bodyText, signature || '', env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Stripe Webhook] Signature verification failed: ${msg}`);
    return NextResponse.json({ error: `Signature verification failed: ${msg}` }, { status: 400 });
  }

  const db = getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!userId) {
          console.warn('[Stripe Webhook] checkout.session.completed triggered without client_reference_id.');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;

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

        console.log(`[Stripe Webhook] Upserting subscription for user ${userId} -> Plan: ${plan}`);

        const { error } = await db
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan: plan,
            status: subscription.status,
            created_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (error) {
          console.error(`[Stripe Webhook] DB upsert failed: ${error.message}`);
        } else {
          // Reset current month usage metrics when new plan is bought
          const now = new Date();
          const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          await db
            .from('usage_metrics')
            .update({ minutes_used: 0 })
            .eq('user_id', userId)
            .eq('billing_period', billingPeriod);
          console.log(`[Stripe Webhook] Reset monthly minutes usage to 0 for user ${userId} on new plan purchase.`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const priceId = subscription.items.data[0]?.price.id;

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

        console.log(`[Stripe Webhook] Updating subscription for customer ${customerId} -> Plan: ${plan}, Status: ${subscription.status}`);

        const { error } = await db
          .from('subscriptions')
          .update({
            plan: plan,
            status: subscription.status,
            stripe_subscription_id: subscriptionId,
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error(`[Stripe Webhook] DB update failed: ${error.message}`);
        } else {
          // Retrieve user_id and old plan details to compare
          const { data: activeSub } = await db
            .from('subscriptions')
            .select('user_id, plan')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();

          if (activeSub && activeSub.plan !== plan) {
            // Plan changed, reset monthly minutes usage
            const now = new Date();
            const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            await db
              .from('usage_metrics')
              .update({ minutes_used: 0 })
              .eq('user_id', activeSub.user_id)
              .eq('billing_period', billingPeriod);
            console.log(`[Stripe Webhook] Plan changed for customer ${customerId} (${activeSub.plan} -> ${plan}). Reset monthly minutes to 0.`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log(`[Stripe Webhook] Customer subscription deleted. Downgrading customer ${customerId} to starter.`);

        const { error } = await db
          .from('subscriptions')
          .update({
            plan: 'starter',
            status: 'canceled',
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error(`[Stripe Webhook] DB downgrade update failed: ${error.message}`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event hook type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('[Stripe Webhook] Internal server error handling webhook event:', err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}
