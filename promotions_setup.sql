-- Create Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL,
    target_type TEXT NOT NULL DEFAULT 'all', -- 'all', 'product', 'brand'
    target_id TEXT, -- Can be a comma separated list of IDs now
    customer_email TEXT,
    max_discount_value NUMERIC, -- Cap for percentage discounts
    usage_limit INTEGER, -- Max total uses for this promo overall
    usage_count INTEGER DEFAULT 0, -- Current uses
    rule_first_order BOOLEAN DEFAULT false, -- Restricted to first time buyers
    rule_one_time_use BOOLEAN DEFAULT false, -- Restricted to 1 use per customer
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alter promotions table if exists
ALTER TABLE IF EXISTS promotions ADD COLUMN IF NOT EXISTS max_discount_value NUMERIC;
ALTER TABLE IF EXISTS promotions ADD COLUMN IF NOT EXISTS usage_limit INTEGER;
ALTER TABLE IF EXISTS promotions ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS promotions ADD COLUMN IF NOT EXISTS rule_first_order BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS promotions ADD COLUMN IF NOT EXISTS rule_one_time_use BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS promotions ADD COLUMN IF NOT EXISTS rule_min_order_amount NUMERIC;
ALTER TABLE IF EXISTS promotions ADD COLUMN IF NOT EXISTS rule_payment_methods TEXT;
ALTER TABLE IF EXISTS promotions ADD COLUMN IF NOT EXISTS rule_min_quantity INTEGER;

-- Add tracking to orders table
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC;

-- Create RPC function to safely increment usage
CREATE OR REPLACE FUNCTION increment_promo_usage(p_code TEXT)
RETURNS void AS $$
BEGIN
  UPDATE promotions
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE code = p_code;
END;
$$ LANGUAGE plpgsql;

-- Note: Run this in your Supabase SQL Editor
