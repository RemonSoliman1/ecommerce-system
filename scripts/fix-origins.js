const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lqshsyndeupsgfbcpxzr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2hzeW5kZXVwc2dmYmNweHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQwMDc1MiwiZXhwIjoyMDg1OTc2NzUyfQ.I8vjr6eVF-Si5v9OLuqPcDRdAW7EqUcFEN7QXd7RG6U';
const supabase = createClient(supabaseUrl, supabaseKey);

// Quick brand map based on typical origins
const brandOrigins = {
    'cohiba': 'Cuba',
    'montecristo': 'Cuba',
    'arturo-fuente': 'Dominican Republic',
    'padron': 'Nicaragua',
    'oliva': 'Nicaragua',
    'romeo-y-julieta': 'Cuba',
    'davidoff': 'Dominican Republic',
    'std': 'France',
    'xikar': 'USA',
    'elie-bleu': 'France',
    'newair': 'USA',
    'audew': 'China',
    'avo': 'Dominican Republic',
    'alec-bradley': 'Honduras',
    'ashton': 'Dominican Republic',
    'macanudo': 'Dominican Republic',
    'partagas': 'Cuba',
    'rocky-patel': 'Honduras',
    'camacho': 'Honduras',
    'factory': 'Nicaragua',
    'habanos': 'Cuba'
};

async function main() {
    console.log('Fetching products...');
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) {
        console.error('Error fetching:', error);
        return;
    }

    let updated = 0;
    for (const p of products) {
        const correctOrigin = brandOrigins[p.brand_id] || 'Imported';
        if (p.origin !== correctOrigin) {
            console.log(`Updating ${p.name} from ${p.origin} to ${correctOrigin}`);
            await supabase.from('products').update({ origin: correctOrigin }).eq('id', p.id);
            updated++;
        }
    }
    console.log(`Updated ${updated} products.`);
}

main().catch(console.error);
