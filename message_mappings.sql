-- 1. Create the permanent chat logs table
CREATE TABLE IF NOT EXISTS public.chat_logs (
    id BIGSERIAL PRIMARY KEY,
    telegram_user_id BIGINT NOT NULL,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'admin', 'bot')),
    message_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quickly fetching a user's history
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON public.chat_logs(telegram_user_id);

-- 2. Create the operational message mappings table
CREATE TABLE IF NOT EXISTS public.message_mappings (
    id BIGSERIAL PRIMARY KEY,
    chat_log_id BIGINT REFERENCES public.chat_logs(id) ON DELETE CASCADE,
    hub_message_id BIGINT NOT NULL,
    customer_message_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for rapid lookup during edit/delete syncs
CREATE INDEX IF NOT EXISTS idx_msg_map_hub_id ON public.message_mappings(hub_message_id);
CREATE INDEX IF NOT EXISTS idx_msg_map_customer_id ON public.message_mappings(customer_message_id);

-- 3. Setup the 30-day Pruning Mechanism (using Supabase pg_cron)
-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cleanup job to run every day at midnight
SELECT cron.schedule(
    'prune_message_mappings', 
    '0 0 * * *', 
    $$ DELETE FROM public.message_mappings WHERE created_at < NOW() - INTERVAL '30 days'; $$
);
