const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Jimp = require('jimp');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const samplers = [
    {
        id: 'oliva-journey', brand_id: 'oliva', name: 'Journey to Oliva Sampler', series: 'Samplers', type: 'cigar',
        description: 'A perfect 8-cigar introduction to the Oliva family of premium cigars.',
        strength: 'Medium-Full', price: 60.00,
        image_source: 'https://placehold.co/600x600/4a2e1b/ffffff.png?text=Oliva+Journey',
        models: [{ name: '8-Cigar Pack', size: 'Assorted', price: 60.00 }]
    },
    {
        id: 'oliva-festive', brand_id: 'oliva', name: 'Oliva Festive Edition Sampler', series: 'Samplers', type: 'cigar',
        description: 'A beautiful 12-cigar collection perfect for holiday gifting.',
        strength: 'Medium-Full', price: 120.00,
        image_source: 'https://placehold.co/600x600/4a2e1b/ffffff.png?text=Oliva+Festive',
        models: [{ name: '12-Cigar Pack', size: 'Assorted', price: 120.00 }]
    },
    {
        id: 'oliva-taste', brand_id: 'oliva', name: 'Taste of Oliva Sampler', series: 'Samplers', type: 'cigar',
        description: 'A 5-cigar tasting flight featuring Oliva\'s highest-rated blends.',
        strength: 'Medium-Full', price: 45.00,
        image_source: 'https://placehold.co/600x600/4a2e1b/ffffff.png?text=Taste+of+Oliva',
        models: [{ name: '5-Cigar Pack', size: 'Assorted', price: 45.00 }]
    },
    {
        id: 'nub-calendar', brand_id: 'nub', name: 'Nub Advent Calendar Sampler', series: 'Samplers', type: 'cigar',
        description: '24 days of thick, flavorful Nub cigars.',
        strength: 'Medium-Full', price: 150.00,
        image_source: 'https://placehold.co/600x600/4a2e1b/ffffff.png?text=Nub+Calendar',
        models: [{ name: '24-Cigar Pack', size: '4x60 Assorted', price: 150.00 }]
    },
    {
        id: 'oliva-melanio-2024', brand_id: 'oliva', name: 'Oliva Serie V Melanio Edicion Limitada 2024', series: 'Serie V Melanio', type: 'cigar',
        description: 'The highly anticipated 2024 limited edition Melanio release.',
        strength: 'Full', price: 250.00,
        image_source: 'https://placehold.co/600x600/4a2e1b/ffffff.png?text=Melanio+2024',
        models: [{ name: 'Box of 10', size: '6.5 x 60', price: 250.00 }]
    },
    {
        id: 'perdomo-connoisseur', brand_id: 'perdomo', name: 'Perdomo Connoisseur Collection', series: 'Samplers', type: 'cigar',
        description: 'Award-winning 12-cigar sampler featuring Perdomo\'s finest.',
        strength: 'Medium-Full', price: 90.00,
        image_source: 'https://placehold.co/600x600/4a2e1b/ffffff.png?text=Perdomo+Connoisseur',
        models: [{ name: '12-Cigar Sampler', size: 'Toro', price: 90.00 }]
    },
    {
        id: 'plasencia-robusto-collection', brand_id: 'plasencia', name: 'Plasencia Robusto Collection Sampler', series: 'Samplers', type: 'cigar',
        description: 'A 5-cigar tasting pack of Plasencia\'s ultra-premium robustos.',
        strength: 'Medium-Full', price: 110.00,
        image_source: 'https://placehold.co/600x600/4a2e1b/ffffff.png?text=Plasencia+Robusto',
        models: [{ name: '5-Cigar Pack', size: 'Robusto', price: 110.00 }]
    },
    {
        id: 'camacho-best-90', brand_id: 'camacho', name: 'Camacho Best of the Best 90+ Rated Sampler', series: 'Samplers', type: 'cigar',
        description: 'A collection of Camacho\'s highest-rated, boldest cigars.',
        strength: 'Full', price: 85.00,
        image_source: 'https://placehold.co/600x600/4a2e1b/ffffff.png?text=Camacho+92+',
        models: [{ name: '10-Cigar Pack', size: 'Assorted', price: 85.00 }]
    },
    {
        id: 'fuente-holiday-robusto', brand_id: 'arturo-fuente', name: 'Arturo Fuente 5 Robusto Sampler', series: 'Samplers', type: 'cigar',
        description: '5 premium Robusto cigars from the legendary Arturo Fuente family.',
        strength: 'Medium', price: 45.00,
        image_source: 'https://placehold.co/600x600/4a2e1b/ffffff.png?text=Fuente+Robusto',
        models: [{ name: '5-Cigar Pack', size: 'Robusto', price: 45.00 }]
    },
    {
        id: 'fuente-holiday-toro', brand_id: 'arturo-fuente', name: 'Arturo Fuente 5 Toro Sampler', series: 'Samplers', type: 'cigar',
        description: '5 premium Toro cigars offering an extended smoke of Fuente excellence.',
        strength: 'Medium', price: 55.00,
        image_source: 'https://placehold.co/600x600/4a2e1b/ffffff.png?text=Fuente+Toro',
        models: [{ name: '5-Cigar Pack', size: 'Toro', price: 55.00 }]
    },
    {
        id: 'drew-factory-maduro', brand_id: 'drew-estate', name: 'Factory Smokes Maduro by Drew Estate', series: 'Factory Smokes', type: 'cigar',
        description: 'An incredibly affordable, sweet, and dark Maduro bundle.',
        strength: 'Medium', price: 45.00,
        image_source: 'https://placehold.co/600x600/4a2e1b/ffffff.png?text=Factory+Smokes',
        models: [{ name: 'Bundle of 25', size: '5 x 50', price: 45.00 }]
    },
    {
        id: 'quorum-classic', brand_id: 'jc-newman', name: 'Quorum Classic Bundle', series: 'Quorum', type: 'cigar',
        description: 'The #1 selling bundle cigar in the world. Great everyday smoke.',
        strength: 'Medium', price: 55.00,
        image_source: 'https://placehold.co/600x600/4a2e1b/ffffff.png?text=Quorum+Classic',
        models: [{ name: 'Bundle of 20', size: '6 x 50', price: 55.00 }]
    },
    {
        id: 'macanudo-ascot', brand_id: 'macanudo', name: 'Macanudo Cafe Ascot Cigarillos', series: 'Cigarillos', type: 'cigarillo',
        description: 'A smooth, mild 15-minute smoke with the classic Macanudo profile.',
        strength: 'Mild', price: 22.00,
        image_source: 'https://placehold.co/600x600/4a2e1b/ffffff.png?text=Macanudo+Ascot',
        models: [{ name: 'Tin of 10', size: '4.1 x 32', price: 22.00 }]
    },
    {
        id: 'ryj-mini', brand_id: 'romeo-y-julieta', name: 'Romeo y Julieta Mini', series: 'Cigarillos', type: 'cigarillo',
        description: 'Classic Cuban-heritage flavor packed into a tiny, convenient cigarillo.',
        strength: 'Medium', price: 20.00,
        image_source: 'https://placehold.co/600x600/4a2e1b/ffffff.png?text=RyJ+Mini',
        models: [{ name: 'Tin of 20', size: '3.5 x 20', price: 20.00 }]
    }
];

async function downloadAndWatermark(url, basename) {
    try {
        const destDir = path.join(__dirname, '..', 'public', 'images', 'products');
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        
        const filename = `${basename}.png`;
        const destPath = path.join(destDir, filename);

        const response = await axios({
            url, responseType: 'arraybuffer',
            headers: { 'User-Agent': "Mozilla/5.0" }
        });
        
        const image = await Jimp.read(response.data);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
        
        const text = "CIGAR LOUNGE";
        const w = image.bitmap.width;
        const h = image.bitmap.height;
        
        image.print(font, 20, h - 40, text);
        
        await image.writeAsync(destPath);
        return `/images/products/${filename}`;
    } catch (e) {
        console.error(`Image processing failed for ${basename}:`, e.message);
        return `/images/cigars/default.png`; // Fallback
    }
}

async function runSeeder() {
    console.log("Starting Samplers & Cigarillos Seeder...");
    let count = 0;
    for (let item of samplers) {
        console.log(`Processing: ${item.name}...`);
        
        // 1. Download and Watermark
        const localImagePath = await downloadAndWatermark(item.image_source, item.id);
        
        // 2. Prepare DB Record
        const record = {
            id: item.id,
            brand_id: item.brand_id,
            name: item.name,
            series: item.series,
            type: item.type,
            description: item.description,
            strength: item.strength,
            image: localImagePath,
            models: item.models,
            price: item.price
        };

        // 3. Upload to Supabase
        const { error } = await supabase.from('products').upsert(record);
        if (error) {
            console.error(`Failed to upload ${item.name}:`, error.message);
        } else {
            console.log(`✅ Uploaded: ${item.name} (${localImagePath})`);
            count++;
        }
    }
    console.log(`\n🎉 Success! Added ${count} new products to the database.`);
}

runSeeder();
