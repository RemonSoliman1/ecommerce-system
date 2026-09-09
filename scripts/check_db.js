const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing credentials in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Check if column exists by trying to select it
  const { data, error } = await supabase.from('products').select('is_visible').limit(1);
  if (error && error.code === '42703') { // column does not exist
    console.log("Adding is_visible column...");
    // Supabase JS doesn't have DDL execution directly, usually we use RPC
    // Let's see if we can do an RPC call or we just report it.
    console.log("Please run this SQL in Supabase: ALTER TABLE products ADD COLUMN is_visible BOOLEAN DEFAULT true;");
  } else {
    console.log("Column is_visible exists or another error:", error ? error.message : "Exists!");
  }
}

main();
