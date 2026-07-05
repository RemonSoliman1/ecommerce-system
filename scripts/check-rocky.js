const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lqshsyndeupsgfbcpxzr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2hzeW5kZXVwc2dmYmNweHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQwMDc1MiwiZXhwIjoyMDg1OTc2NzUyfQ.I8vjr6eVF-Si5v9OLuqPcDRdAW7EqUcFEN7QXd7RG6U';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: products } = await supabase.from('products').select('*').ilike('name', '%Sumatra%');
    console.log(products);
}

main().catch(console.error);
