const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: prods } = await supabase.from('products').select('*').in('brand_id', ['drew-estate', 'infused-drew']);
    for (const p of prods) {
        let newBrand = p.brand_id;
        const n = p.name.toLowerCase();
        
        if (n.includes('tabak')) newBrand = 'tabak-especial';
        else if (n.includes('java')) newBrand = 'java';
        else if (n.includes('isla del sol')) newBrand = 'isla-del-sol';
        else if (n.includes('kentucky')) newBrand = 'kentucky-fire-cured';
        else if (n.includes('pappy')) newBrand = 'pappy-van-winkle';
        else if (n.includes('the egg')) newBrand = 'the-egg';
        else if (n.includes('blackened')) newBrand = 'blackened';
        else if (n.includes('20 acre')) newBrand = '20-acre-farm';
        else if (n.includes('nica rustica')) newBrand = 'nica-rustica';

        if (newBrand !== p.brand_id) {
            await supabase.from('products').update({ brand_id: newBrand }).eq('id', p.id);
            console.log(`Migrated ${p.name} to ${newBrand}`);
        }
    }
    console.log("Done");
}

run();
