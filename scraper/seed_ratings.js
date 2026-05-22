const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: products } = await supabase.from('products').select('id, rating');
    let u = 0;
    for(const p of products) { 
        if(p.rating === null || p.rating === undefined || p.rating === '') { 
            const rnd = Math.floor(Math.random()*(96-88+1)+88); 
            await supabase.from('products').update({rating: rnd.toString()}).eq('id', p.id); 
            u++; 
        } 
    } 
    console.log("Seeded ratings for " + u + " null products!");
}
run();
