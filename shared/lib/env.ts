import { z } from 'zod';

// Strict validation schema for all environment variables
const EnvSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Retell AI Voice Engine
  RETELL_API_KEY: z.string().min(1, 'RETELL_API_KEY is required'),
  RETELL_WEBHOOK_SECRET: z.string().min(1, 'RETELL_WEBHOOK_SECRET is required'),

  // Twilio Telephony
  TWILIO_ACCOUNT_SID: z.string().min(1, 'TWILIO_ACCOUNT_SID is required'),
  TWILIO_AUTH_TOKEN: z.string().min(1, 'TWILIO_AUTH_TOKEN is required'),

  // Anthropic Claude
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),

  // Stripe Configuration
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // Stripe Price IDs
  NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_AGENCY_MONTHLY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_AGENCY_YEARLY: z.string().optional(),
});

// Infer the compiled environment type safely
export type EnvConfig = z.infer<typeof EnvSchema>;

function loadEnv(): EnvConfig {
  const result = EnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RETELL_API_KEY: process.env.RETELL_API_KEY,
    RETELL_WEBHOOK_SECRET: process.env.RETELL_WEBHOOK_SECRET,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY,
    NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY,
    NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
    NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
    NEXT_PUBLIC_STRIPE_PRICE_AGENCY_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_MONTHLY,
    NEXT_PUBLIC_STRIPE_PRICE_AGENCY_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_YEARLY,
  });

  if (!result.success) {
    console.error('❌ Invalid or missing Environment Configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Application environment validation failed.');
  }

  return result.data;
}

export const env = loadEnv();
