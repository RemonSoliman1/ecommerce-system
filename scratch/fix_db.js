const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
);

async function fix() {
    const { data: attrs } = await supabase.from('product_attributes').select('*').eq('category', 'home_promotion');
    console.log("Current home_promotions:", attrs.map(a => a.value));

    // The user mentioned cigar stand
    const stand = attrs.find(a => a.value === 'Cigar stand');
    if (stand) {
        await supabase.from('product_attributes').update({ category: 'gift_package' }).eq('id', stand.id);
        console.log("Fixed Cigar stand!");
    }
    const kit = attrs.find(a => a.value === 'kit');
    if (kit) {
        await supabase.from('product_attributes').update({ category: 'gift_package' }).eq('id', kit.id);
        console.log("Fixed kit!");
    }
}
fix();
