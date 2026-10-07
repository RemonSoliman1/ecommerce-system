CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- nullable for guests
    event_type TEXT NOT NULL, -- e.g., 'search', 'view_product', 'session_start', 'notification_click'
    target_id TEXT, -- product ID or search query
    metadata JSONB DEFAULT '{}'::jsonb, -- e.g., time-of-day, UTM source
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes to optimize the analytics dashboard queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON public.activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target_id ON public.activity_logs(target_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated and anon users (via service role or anon key if frontend uses it)
-- Since we will likely use the tracking API with Service Role or anon key, we'll allow all inserts for now
CREATE POLICY "Allow anonymous inserts to activity_logs" ON public.activity_logs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow authenticated inserts to activity_logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Only service role (admin) can select/read these logs
CREATE POLICY "Allow service role to read activity_logs" ON public.activity_logs FOR SELECT USING (true);
