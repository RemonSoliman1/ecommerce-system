const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function migrateDrewEstate() {
    console.log("Fetching Drew Estate products...");
    const { data: products, error } = await supabase.from('products').select('*').eq('brand_id', 'drew-estate');
    if (error) { console.error(error); return; }

    console.log(`Found ${products.length} Drew Estate products to migrate.`);

    for (const p of products) {
        let newBrand = 'drew-estate';
        let newSeries = p.series || p.name;
        
        const n = p.name.toLowerCase();
        
        if (n.includes('factory smoke')) {
            newBrand = 'factory-smokes';
            // Extract shade/sweet/maduro
            if (n.includes('maduro')) newSeries = 'Maduro';
            else if (n.includes('shade')) newSeries = 'Shade';
            else if (n.includes('sun grown')) newSeries = 'Sun Grown';
            else if (n.includes('sweet')) newSeries = 'Sweet';
            else newSeries = 'Classic';
        } else if (n.includes('liga')) {
            newBrand = 'liga-privada';
            if (n.includes('undercrown')) newSeries = 'Undercrown ' + (n.includes('shade') ? 'Shade' : (n.includes('10') ? '10' : 'Maduro'));
            else if (n.includes('9')) newSeries = 'No. 9';
            else if (n.includes('t52')) newSeries = 'T52';
            else if (n.includes('unico')) newSeries = 'Unico Serie';
            else if (n.includes('aniversario')) newSeries = 'Aniversario';
            else if (n.includes('h99')) newSeries = 'H99';
        } else if (n.includes('deadwood')) {
            newBrand = 'deadwood';
            if (n.includes('dominicana')) newSeries = 'Dominicana';
            else if (n.includes('no name')) newSeries = 'Girl With No Name';
            else newSeries = 'Classic';
        } else if (n.includes('acid')) {
            newBrand = 'acid';
            if (n.includes('20')) newSeries = 'Acid 20';
            else newSeries = 'Classic';
        } else if (n.includes('herrera')) {
            newBrand = 'herrera-esteli';
            if (n.includes('maduro')) newSeries = 'Maduro';
            else if (n.includes('habano')) newSeries = 'Habano';
            else newSeries = 'Classic';
        } else if (n.includes('tabak') || n.includes('java') || n.includes('isla del sol')) {
            newBrand = 'infused-drew';
            if (n.includes('java mint')) newSeries = 'Java Mint';
            else if (n.includes('java red')) newSeries = 'Java Red';
            else if (n.includes('java latte')) newSeries = 'Java Latte';
            else if (n.includes('java')) newSeries = 'Java Classic';
            else if (n.includes('tabak')) newSeries = 'Tabak Especial';
            else newSeries = 'Isla del Sol';
        }

        // Also fix the random uppercase Camacho
        const { error: updErr } = await supabase.from('products').update({ brand_id: newBrand, series: newSeries }).eq('id', p.id);
        if (updErr) console.error(`Error updating ${p.name}:`, updErr.message);
        else console.log(`Migrated ${p.name} -> Brand: ${newBrand} | Series: ${newSeries}`);
    }
    
    // Fix Camacho Casings
    const { data: camachos } = await supabase.from('products').select('*').ilike('brand_id', 'Camacho');
    if (camachos) {
         for (const c of camachos) {
             if (c.brand_id !== 'camacho') {
                 await supabase.from('products').update({ brand_id: 'camacho' }).eq('id', c.id);
                 console.log(`Lowercased brand_id for ${c.name}`);
             }
         }
    }
    
    console.log("Migration Complete.");
}

migrateDrewEstate();
