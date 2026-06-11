-- ==========================================================
-- Migration: Add Admin Roles and Global Policies Override
-- ==========================================================

-- 1. Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')) NOT NULL;

-- 2. Create high-performance SECURITY DEFINER function to verify admin permissions safely
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- 3. Drop existing policies to allow clean recreation with admin overrides

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users and admins can view profiles" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users and admins can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id OR public.is_admin());


-- Agents Policies
DROP POLICY IF EXISTS "Users can perform all operations on own agents" ON public.agents;

CREATE POLICY "Users and admins can manage agents" 
ON public.agents FOR ALL 
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());


-- Phone Numbers Policies
DROP POLICY IF EXISTS "Users can perform all operations on own phone numbers" ON public.phone_numbers;

CREATE POLICY "Users and admins can manage phone numbers" 
ON public.phone_numbers FOR ALL 
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());


-- Agent Versions Policies
DROP POLICY IF EXISTS "Users can view versions of owned agents" ON public.agent_versions;
DROP POLICY IF EXISTS "Users can record new versions for owned agents" ON public.agent_versions;

CREATE POLICY "Users and admins can view versions" 
ON public.agent_versions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.agents a 
    WHERE a.id = agent_versions.agent_id 
    AND (a.user_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Users and admins can record versions" 
ON public.agent_versions FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agents a 
    WHERE a.id = agent_versions.agent_id 
    AND (a.user_id = auth.uid() OR public.is_admin())
  )
);


-- Calls Policies
DROP POLICY IF EXISTS "Users can perform all operations on own calls" ON public.calls;

CREATE POLICY "Users and admins can manage calls" 
ON public.calls FOR ALL 
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());


-- Leads Policies
DROP POLICY IF EXISTS "Users can perform all operations on own leads" ON public.leads;

CREATE POLICY "Users and admins can manage leads" 
ON public.leads FOR ALL 
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());


-- Webhook Events Policies
DROP POLICY IF EXISTS "Users can read own webhook events" ON public.webhook_events;

CREATE POLICY "Users and admins can read webhook events" 
ON public.webhook_events FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());


-- Usage Metrics Policies
DROP POLICY IF EXISTS "Users can view own usage metrics" ON public.usage_metrics;

CREATE POLICY "Users and admins can view usage metrics" 
ON public.usage_metrics FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());


-- Subscriptions Policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

CREATE POLICY "Users and admins can view subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());


-- Audit Logs Policies
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;

CREATE POLICY "Users and admins can view audit logs" 
ON public.audit_logs FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());
