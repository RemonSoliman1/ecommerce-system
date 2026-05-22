const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSubbrands() {
  console.log('Fetching all products...');
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('*');

  if (fetchError) {
    console.error("Error fetching products:", fetchError.message);
    return;
  }

  console.log(`Found ${products.length} products to evaluate.`);
  let updatedCount = 0;

  for (const product of products) {
    // If series is missing, null, or empty, set it to the product name
    if (!product.series) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ series: product.name })
        .eq('id', product.id);

      if (updateError) {
        console.error(`Failed to update ${product.name}:`, updateError.message);
      } else {
        console.log(`Updated series for: ${product.name}`);
        updatedCount++;
      }
    }
  }

  console.log(`\n✅ Migration Complete. Updated ${updatedCount} products.`);
}

fixSubbrands();
