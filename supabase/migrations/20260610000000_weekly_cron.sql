-- Enable the pg_net extension to make HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the cron schedule for every Monday at 9:00 AM UTC
-- NOTE: Replace [YOUR_SUPABASE_PROJECT_REF] with your actual project reference ID (e.g. abcdefghijklmnop)
-- NOTE: Replace [YOUR_ANON_KEY] with your actual project anon key
SELECT cron.schedule(
  'weekly-leads-summary',
  '0 9 * * 1',
  $$
    SELECT net.http_post(
      url:='https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/functions/v1/send-weekly-summary',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer [YOUR_ANON_KEY]"}'::jsonb,
      body:='{}'::jsonb
    );
  $$
);
