const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const baseModels = [
    { name: "Robusto", size: "Ask", price: 10.00, stock: 20 },
    { name: "Toro", size: "Ask", price: 12.00, stock: 20 }
];

const otherLines = [
    {
        id: 'drew-estate-blackened',
        brand_id: 'drew-estate',
        name: 'Blackened',
        series: 'Blackened',
        type: 'cigar',
        description: 'A collaboration with James Hetfield of Metallica, featuring a rich Maduro wrapper.',
        strength: 'Medium-to-Full',
        image: '/images/brands/drew-estate/liga-undercrown-by-drew-estate.jpg',
        models: baseModels
    },
    {
        id: 'drew-estate-nica-rustica',
        brand_id: 'drew-estate',
        name: 'Nica Rustica',
        series: 'Nica Rustica',
        type: 'cigar',
        description: 'A rugged, rustic smoke paying homage to the people of Esteli.',
        strength: 'Medium-to-Full',
        image: '/images/brands/drew-estate/liga-privada-9-by-drew-estate.jpg',
        models: baseModels
    },
    {
        id: 'drew-estate-20-acre-farm',
        brand_id: 'drew-estate',
        name: '20 Acre Farm',
        series: '20 Acre Farm',
        type: 'cigar',
        description: 'Features rare Florida Sun Grown tobacco for a uniquely smooth experience.',
        strength: 'Medium',
        image: '/images/brands/drew-estate/liga-undercrown-shade-by-drew-estate.jpg',
        models: baseModels
    },
    {
        id: 'drew-estate-kentucky-fire-cured',
        brand_id: 'drew-estate',
        name: 'Kentucky Fire Cured',
        series: 'Kentucky Fire Cured',
        type: 'cigar',
        description: 'Smoky, campfire-like aromas from fire-cured tobacco leaves.',
        strength: 'Medium-to-Full',
        image: '/images/brands/drew-estate/deadwood.jpg',
        models: baseModels
    },
    {
        id: 'drew-estate-pappy-van-winkle',
        brand_id: 'drew-estate',
        name: 'Pappy Van Winkle',
        series: 'Pappy Van Winkle',
        type: 'cigar',
        description: 'Exclusive barrel-fermented cigars crafted for the ultimate bourbon pairing.',
        strength: 'Medium-to-Full',
        image: '/images/brands/drew-estate/liga-privada-unico.jpg',
        models: baseModels
    },
    {
        id: 'drew-estate-the-egg',
        brand_id: 'drew-estate',
        name: 'The Egg',
        series: 'The Egg',
        type: 'cigar',
        description: 'A massive, uniquely shaped artisanal smoke originally from the Natural series.',
        strength: 'Medium',
        image: '/images/brands/drew-estate/acid-by-drew-estate.jpg',
        models: baseModels
    }
];

async function seed() {
    console.log("Seeding Other Drew Estate Lines...");
    for (const prod of otherLines) {
        // Fallback images are already existing valid images reused!
        const { error } = await supabase.from('products').upsert(prod);
        if (error) {
            console.error(`Error uploading ${prod.name}:`, error.message);
        } else {
            console.log(`Successfully seeded ${prod.name}`);
        }
    }
}

seed();
