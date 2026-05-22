const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const FLAVORS = ['Woody', 'Spicy', 'Earthy', 'Leather', 'Coffee', 'Cocoa', 'Nutty', 'Creamy', 'Sweet', 'Pepper', 'Cedar', 'Vanilla', 'Floral'];

// Helper to reliably random shuffle and slice
function getRandomFlavors(count) {
    const shuffled = [...FLAVORS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

async function run() {
    const { data: products } = await supabase.from('products').select('id, flavor_profile, strength');
    let u = 0;
    for(const p of products) { 
        if(!p.flavor_profile || p.flavor_profile.length === 0) { 
            let count = Math.floor(Math.random() * 3) + 2; // 2 to 4 flavors
            let f = getRandomFlavors(count);
            
            // Bias based on strength
            if (p.strength && p.strength.toLowerCase().includes('mild')) {
                f = ['Creamy', 'Cedar', ...f.filter(x => x !== 'Pepper' && x !== 'Spicy')].slice(0, count);
            }
            if (p.strength && p.strength.toLowerCase().includes('full')) {
                f = ['Pepper', 'Leather', ...f.slice(0, count - 1)];
            }
            
            await supabase.from('products').update({ flavor_profile: [...new Set(f)] }).eq('id', p.id); 
            u++; 
        } 
    } 
    console.log("Seeded realistic flavors for " + u + " products!");
}

run();
