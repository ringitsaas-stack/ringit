-- 1. Profiles Table (Linked to Supabase Auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Plan Limits Table
CREATE TABLE IF NOT EXISTS public.plan_limits (
  plan TEXT PRIMARY KEY CHECK (plan IN ('starter', 'pro', 'agency')),
  max_agents INTEGER NOT NULL,
  max_minutes INTEGER NOT NULL,
  max_users INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on plan_limits (public read access only)
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- Seed Plan Limits Atomic Dataset
INSERT INTO public.plan_limits (plan, max_agents, max_minutes, max_users) VALUES
  ('starter', 1, 100, 1),
  ('pro',     5, 500, 3),
  ('agency',  20, 2000, 10)
ON CONFLICT (plan) DO UPDATE SET
  max_agents = EXCLUDED.max_agents,
  max_minutes = EXCLUDED.max_minutes,
  max_users = EXCLUDED.max_users;

-- 3. Agents Table (Decoupled Voice Provider Schema)
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  tone TEXT,
  services TEXT,
  lead_email TEXT NOT NULL,
  provider TEXT NOT NULL,                  -- 'retell', 'vapi', 'smallest_ai'
  provider_agent_id TEXT NOT NULL,         -- External voice provider AI model reference
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ,
  UNIQUE (provider, provider_agent_id)
);

-- Enable RLS on agents
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- 4. Phone Numbers Table (Decoupled Telephony Schema)
CREATE TABLE IF NOT EXISTS public.phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  twilio_phone_number TEXT NOT NULL,
  twilio_phone_sid TEXT UNIQUE NOT NULL,
  provider_phone_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'released')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on phone_numbers
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

-- 5. Agent Versions Table (Configuration Backups)
CREATE TABLE IF NOT EXISTS public.agent_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  config JSONB NOT NULL,                   -- Holds voice ID, tone, lead email metadata
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on agent_versions
ALTER TABLE public.agent_versions ENABLE ROW LEVEL SECURITY;

-- 6. Calls Table
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_call_id TEXT UNIQUE NOT NULL,
  caller_phone TEXT,
  duration_seconds INTEGER DEFAULT 0 NOT NULL,
  summary TEXT,
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS on calls
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- 7. Leads Table (Direct user_id Association)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  phone TEXT,
  intent TEXT,
  summary TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'lost')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Index for leads dashboard rendering
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);

-- 8. Webhook Events Queue (Reliable Event Processing)
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')) NOT NULL,
  retry_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on webhook_events
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- 9. Usage Metrics Table
CREATE TABLE IF NOT EXISTS public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  minutes_used NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  calls_count INTEGER DEFAULT 0 NOT NULL,
  billing_period TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (agent_id, billing_period)
);

-- Enable RLS on usage_metrics
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

-- Composite index to avoid full table scans on Stripe minute calculations
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_billing ON public.usage_metrics(user_id, billing_period);

-- 10. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT DEFAULT 'starter' REFERENCES public.plan_limits(plan) NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 11. Feature Flags Table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on feature_flags
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
