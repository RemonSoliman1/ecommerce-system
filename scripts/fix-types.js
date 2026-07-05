const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lqshsyndeupsgfbcpxzr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2hzeW5kZXVwc2dmYmNweHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQwMDc1MiwiZXhwIjoyMDg1OTc2NzUyfQ.I8vjr6eVF-Si5v9OLuqPcDRdAW7EqUcFEN7QXd7RG6U';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Fetching products...');
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) {
        console.error('Error fetching:', error);
        return;
    }

    let updated = 0;
    for (const p of products) {
        if (p.name.toLowerCase().includes('small cigar') && p.type !== 'cigarillo') {
            console.log(`Updating ${p.name} from ${p.type} to cigarillo`);
            await supabase.from('products').update({ type: 'cigarillo' }).eq('id', p.id);
            updated++;
        }
    }
    console.log(`Updated ${updated} product types.`);
}

main().catch(console.error);
