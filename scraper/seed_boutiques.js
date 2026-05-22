const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const baseModels = [
    { name: "Robusto", size: "Unknown", price: 15.00, stock: 20 },
    { name: "Toro", size: "Unknown", price: 18.00, stock: 20 }
];

const boutiqueLines = [
    // ZINO
    { id: 'zino-platinum', brand_id: 'zino', name: 'Zino Platinum', series: 'Zino Platinum', type: 'cigar', description: 'Exceptional blend, representing modern luxury.', strength: 'Medium', image: '/images/brands/cohiba.png', models: baseModels },
    { id: 'zino-nicaragua', brand_id: 'zino', name: 'Zino Nicaragua', series: 'Zino Nicaragua', type: 'cigar', description: 'Vibrant and intense Nicaraguan flavors.', strength: 'Medium-to-Full', image: '/images/brands/padron.png', models: baseModels },
    { id: 'zino-classic', brand_id: 'zino', name: 'Zino Classic', series: 'Zino Classic', type: 'cigar', description: 'The timeless, elegant classic blend.', strength: 'Mild-to-Medium', image: '/images/brands/oliva.png', models: baseModels },

    // EL SEPTIMO
    { id: 'el-septimo-sacred-arts', brand_id: 'el-septimo', name: 'Sacred Arts Collection', series: 'Sacred Arts Collection', type: 'cigar', description: 'A tribute to the world\'s greatest masterpieces.', strength: 'Full', image: '/images/brands/fuente.png', models: baseModels },
    { id: 'el-septimo-emperor', brand_id: 'el-septimo', name: 'Emperor Collection', series: 'Emperor Collection', type: 'cigar', description: 'Royal blends steeped in Costa Rican tradition.', strength: 'Medium-to-Full', image: '/images/brands/davidoff.png', models: baseModels },

    // CHATEAU DIADEM
    { id: 'chateau-diadem-conviction', brand_id: 'chateau-diadem', name: 'Conviction', series: 'Conviction', type: 'cigar', description: 'A conviction to perfection and luxury.', strength: 'Medium-to-Full', image: '/images/brands/my-father.png', models: baseModels }
];

async function seed() {
    console.log("Seeding Boutiques...");
    for (const prod of boutiqueLines) {
        const { error } = await supabase.from('products').upsert(prod);
        if (error) {
            console.error(`Error uploading ${prod.name}:`, error.message);
        } else {
            console.log(`Successfully seeded ${prod.name}`);
        }
    }
    console.log("Done seeding boutiques!");
}

seed();
