-- 1. Update Users Table with Churn & Time Tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS activity_status VARCHAR(50) DEFAULT 'Active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_engagement_time INTEGER DEFAULT 14; -- 0-23 (Hour of day)
ALTER TABLE users ADD COLUMN IF NOT EXISTS weekend_start_day INTEGER DEFAULT 5; -- 5=Friday, 6=Saturday
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_stockup_day INTEGER DEFAULT 3; -- e.g., Wednesday

-- 2. Create The TTL Buffer Table
CREATE TABLE IF NOT EXISTS weekly_visit_buffer (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    visited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_visit_buffer_user_id ON weekly_visit_buffer(user_id);
