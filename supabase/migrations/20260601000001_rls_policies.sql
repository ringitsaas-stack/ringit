-- ==========================================
-- 1. Profiles Table Policies
-- ==========================================
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile during signup" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- ==========================================
-- 2. Plan Limits Table Policies
-- ==========================================
CREATE POLICY "Anyone authenticated can view plan limits" 
ON public.plan_limits FOR SELECT 
TO authenticated 
USING (true);

-- ==========================================
-- 3. Agents Table Policies
-- ==========================================
CREATE POLICY "Users can perform all operations on own agents" 
ON public.agents FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 4. Phone Numbers Table Policies
-- ==========================================
CREATE POLICY "Users can perform all operations on own phone numbers" 
ON public.phone_numbers FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 5. Agent Versions Table Policies
-- ==========================================
CREATE POLICY "Users can view versions of owned agents" 
ON public.agent_versions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.agents a 
    WHERE a.id = agent_versions.agent_id 
    AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Users can record new versions for owned agents" 
ON public.agent_versions FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agents a 
    WHERE a.id = agent_versions.agent_id 
    AND a.user_id = auth.uid()
  )
);

-- ==========================================
-- 6. Calls Table Policies
-- ==========================================
CREATE POLICY "Users can perform all operations on own calls" 
ON public.calls FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 7. Leads Table Policies
-- ==========================================
CREATE POLICY "Users can perform all operations on own leads" 
ON public.leads FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 8. Webhook Events Table Policies
-- ==========================================
CREATE POLICY "Users can read own webhook events" 
ON public.webhook_events FOR SELECT 
USING (auth.uid() = user_id);

-- ==========================================
-- 9. Usage Metrics Table Policies
-- ==========================================
CREATE POLICY "Users can view own usage metrics" 
ON public.usage_metrics FOR SELECT 
USING (auth.uid() = user_id);

-- ==========================================
-- 10. Subscriptions Table Policies
-- ==========================================
CREATE POLICY "Users can view own subscription" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- ==========================================
-- 11. Feature Flags Table Policies
-- ==========================================
CREATE POLICY "Anyone authenticated can read active feature flags" 
ON public.feature_flags FOR SELECT 
TO authenticated 
USING (true);

-- ==========================================
-- 12. Audit Logs Table Policies
-- ==========================================
CREATE POLICY "Users can view own audit logs" 
ON public.audit_logs FOR SELECT 
USING (auth.uid() = user_id);
