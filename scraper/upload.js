require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Prefer the service role key to bypass RLS when uploading, fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadToSupabase(jsonFilePath) {
    console.log(`Reading ${jsonFilePath}...`);
    const rawData = fs.readFileSync(jsonFilePath);
    const products = JSON.parse(rawData);
    
    console.log(`Found ${products.length} products. Beginning upload...`);
    
    for (const product of products) {
        // Prepare the main product
        const { id, brandId, name, type, description, strength, image, models } = product;
        
        console.log(`Uploading ${name}...`);
        
        // Match the database schema provided:
        const productRecord = {
            id: id,
            brand_id: brandId,
            name: name,
            series: name,
            type: type || 'cigar',
            description: description,
            strength: strength,
            image: image,
            models: models || [], // Using the jsonb column
            price: models && models.length > 0 ? (parseFloat(models[0].price) || 0) : 0 // Populate root price numeric field
        };
        
        // 1. Upsert the Product
        const { error: upsertError } = await supabase
            .from('products')
            .upsert(productRecord, { onConflict: 'id' });
            
        if (upsertError) {
             console.error(`Error upserting product ${name}:`, upsertError.message);
        } else {
             console.log(`  Successfully synced ${name} with its models.`);
        }
    }
    console.log('Upload complete!');
}

const targetFile = process.argv[2] || 'products.json';
uploadToSupabase(targetFile).catch(console.error);
