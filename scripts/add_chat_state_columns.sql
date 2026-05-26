-- Add Chat State, Rolling Buffer, and Ghost Edit columns for CRM integration
ALTER TABLE telegram_users 
ADD COLUMN IF NOT EXISTS is_live_chat_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mirror_system_logs BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS recent_actions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS live_log_message_id INTEGER;
