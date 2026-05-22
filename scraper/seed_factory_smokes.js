const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const baseModels = [
    { name: "Robusto - 5 x 54", size: "Ask", price: 42.00, stock: 20 },
    { name: "Toro - 6 x 52", size: "Ask", price: 45.00, stock: 20 },
    { name: "Churchill - 7 x 50", size: "Ask", price: 48.00, stock: 15 },
    { name: "Gordito - 6 x 60", size: "Ask", price: 53.00, stock: 10 }
];

const factorySmokes = [
    {
        id: 'factory-smokes-maduro',
        brand_id: 'drew-estate',
        name: 'Factory Smokes Maduro',
        series: 'Factory Smokes Maduro',
        type: 'bundle',
        description: 'An oily, dark premium bundle smoke featuring rich notes of espresso and dark chocolate.',
        strength: 'Medium-to-Full',
        image: '/images/brands/drew-estate/factory-smokes-maduro.jpg',
        models: baseModels
    },
    {
        id: 'factory-smokes-shade',
        brand_id: 'drew-estate',
        name: 'Factory Smokes Shade',
        series: 'Factory Smokes Shade',
        type: 'bundle',
        description: 'A smooth, creamy Connecticut Shade wrapper offering an easy, mellow body experience.',
        strength: 'Mild-to-Medium',
        image: '/images/brands/drew-estate/factory-smokes-shade.jpg',
        models: baseModels
    },
    {
        id: 'factory-smokes-sun-grown',
        brand_id: 'drew-estate',
        name: 'Factory Smokes Sun Grown',
        series: 'Factory Smokes Sun Grown',
        type: 'bundle',
        description: 'Brimming with earthy and slightly spicy notes from a Habano Sun Grown wrapper.',
        strength: 'Medium',
        image: '/images/brands/drew-estate/factory-smokes-sun-grown.jpg',
        models: baseModels
    },
    {
        id: 'factory-smokes-sweet',
        brand_id: 'drew-estate',
        name: 'Factory Smokes Sweet',
        series: 'Factory Smokes Sweet',
        type: 'bundle',
        description: 'A well-balanced, subtly sweetened tip that enhances the natural tobacco flavors without being artificial.',
        strength: 'Mild-to-Medium',
        image: '/images/brands/drew-estate/factory-smokes-sweet.jpg',
        models: baseModels
    }
];

async function seed() {
    console.log("Seeding Factory Smokes...");
    for (const prod of factorySmokes) {
        // Copy a placeholder image to ensure UI renders
        const srcImg = path.join(__dirname, '..', 'public', 'images', 'brands', 'drew-estate', 'liga-undercrown-by-drew-estate.jpg');
        const destImg = path.join(__dirname, '..', 'public', 'images', 'brands', 'drew-estate', `${prod.id}.jpg`);
        
        try {
            if (fs.existsSync(srcImg) && !fs.existsSync(destImg)) {
                fs.copyFileSync(srcImg, destImg);
            }
        } catch(e) {
            console.log("Skipping image copy");
        }

        const { error } = await supabase.from('products').upsert(prod);
        if (error) {
            console.error(`Error uploading ${prod.name}:`, error.message);
        } else {
            console.log(`Successfully seeded ${prod.name}`);
        }
    }
}

seed();
