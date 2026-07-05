const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Fetching products...");
    const { data: products, error } = await supabase.from('products').select('id, models');
    if (error) throw error;

    let updatedCount = 0;

    for (const p of products) {
        if (!p.models || !Array.isArray(p.models)) continue;
        let modified = false;

        const newModels = p.models.map(m => {
            if (!m.size) return m;
            let sizeStr = String(m.size);
            if (sizeStr.includes('-')) {
                // e.g. "Toro - 6x52" or "Toro - 6 x 52"
                const parts = sizeStr.split('-');
                const newSize = parts[0].trim();
                let newDims = parts[1].trim();
                // If it looks like dims "6x52" or "6 x 52"
                if (/^[0-9.]+\s*[xX]\s*[0-9.]+$/.test(newDims)) {
                    m.size = newSize;
                    if (!m.dimensions) {
                        m.dimensions = newDims;
                    }
                    modified = true;
                }
            }
            return m;
        });

        if (modified) {
            console.log(`Updating product ${p.id}...`);
            const { error: updateErr } = await supabase.from('products').update({ models: newModels }).eq('id', p.id);
            if (updateErr) console.error(updateErr);
            else updatedCount++;
        }
    }

    console.log(`Updated ${updatedCount} products.`);

    // Now fix attributes table
    console.log("Fetching size attributes...");
    const { data: attrs, error: attrErr } = await supabase.from('product_attributes').select('*').eq('category', 'size');
    if (attrErr) throw attrErr;

    for (const attr of attrs) {
        if (attr.value.includes('-')) {
            console.log(`Deleting size attribute ${attr.value}`);
            await supabase.from('product_attributes').delete().eq('id', attr.id);
        }
    }
    console.log("Done fixing DB.");
}

run();
