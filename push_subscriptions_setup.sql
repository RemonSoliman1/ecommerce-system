-- Create Push Subscriptions Table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    subscription_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Failsafe for missing columns if created manually via UI
ALTER TABLE IF EXISTS push_subscriptions ADD COLUMN IF NOT EXISTS endpoint TEXT UNIQUE;
ALTER TABLE IF EXISTS push_subscriptions ADD COLUMN IF NOT EXISTS subscription_data JSONB;
ALTER TABLE IF EXISTS push_subscriptions ADD COLUMN IF NOT EXISTS user_id UUID;

-- Note: Run this in your Supabase SQL Editor
