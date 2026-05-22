const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    // 1. Fix Factory Smokes (and other bundle labeled items if any) to appear in the 'cigar' hover
    const { data: fsProds } = await supabase.from('products').select('*').eq('brand_id', 'factory-smokes');
    for (const p of fsProds) {
        await supabase.from('products').update({ type: 'cigar' }).eq('id', p.id);
        console.log(`Updated ${p.name} to type: cigar`);
    }

    // 2. Classify Cigarillos
    const { data: allProds } = await supabase.from('products').select('id, name, series, type').neq('type', 'cigarillo');
    
    let cigarilloCount = 0;
    for (const p of allProds) {
        const n = String(p.name).toLowerCase();
        const s = String(p.series || '').toLowerCase();
        
        // Accurate pattern matching to isolate small smokes without hitting "20th Anniversary"
        if (
            n.includes(' club') || s.includes(' club') ||
            n.includes(' mini') || s.includes(' mini') ||
            n.includes(' tin') || s.includes(' tin') || 
            n.includes(' cigarillos') || s.includes(' cigarillos') ||
            n.includes(' purito') || s.includes(' purito') ||
            n.includes(' machitos') || s.includes(' machitos') ||
            n.endsWith(' 20') || s.endsWith(' 20') || n.includes(' 20 count') ||
            n.includes(' petit') || s.includes(' petit') || // usually small, but sometimes coronas. Let's stick to true smalls:
            n.includes(' demi tasse')
        ) {
            // Guard clause to protect false positives like "Acid 20", "Undercrown 10" (which doesn't have 20), "20 Acre Farm"
            if (n.includes('acid 20') || n.includes('20 acre')) continue;
            
            await supabase.from('products').update({ type: 'cigarillo' }).eq('id', p.id);
            console.log(`Isolated Cigarillo: ${p.name}`);
            cigarilloCount++;
        }
    }
    
    console.log(`Finished filtering! Migrated ${cigarilloCount} items to cigarillos.`);
}
run();
