const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lqshsyndeupsgfbcpxzr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2hzeW5kZXVwc2dmYmNweHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQwMDc1MiwiZXhwIjoyMDg1OTc2NzUyfQ.I8vjr6eVF-Si5v9OLuqPcDRdAW7EqUcFEN7QXd7RG6U';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: products } = await supabase.from('products').select('*');
    
    let behikeCount = 0;
    let monteCount = 0;
    
    products.forEach(p => {
        if (p.image?.includes('cohiba-behike.png') && p.brand_id !== 'cohiba') behikeCount++;
        if (p.image?.includes('montecristo-no2.png') && p.brand_id !== 'montecristo') monteCount++;
    });

    console.log(`Behike images on wrong brand: ${behikeCount}`);
    console.log(`Montecristo images on wrong brand: ${monteCount}`);
    
    // Let's just count how many products have exact same image URL
    const imageCounts = {};
    products.forEach(p => {
        if(p.image) {
            imageCounts[p.image] = (imageCounts[p.image] || 0) + 1;
        }
    });
    
    console.log('Most repeated images:');
    Object.entries(imageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([img, count]) => {
            console.log(`${img}: ${count} products`);
        });
}

main().catch(console.error);
