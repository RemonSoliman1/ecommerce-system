const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const mappings = {
    'oliva-melanio-2024': 'oliva_melanio_2024_test_1779916028861.png',
    'oliva-journey': 'oliva_journey_1779916053390.png',
    'oliva-festive': 'oliva_festive_1779916066045.png',
    'oliva-taste': 'oliva_taste_1779916080701.png',
    'nub-calendar': 'nub_calendar_1779916093549.png',
    'perdomo-connoisseur': 'perdomo_connoisseur_1779916119629.png',
    'plasencia-robusto-collection': 'plasencia_robusto_collection_1779916133034.png',
    'camacho-best-90': 'camacho_best_90_1779916147228.png',
    'fuente-holiday-robusto': 'fuente_holiday_robusto_1779916166954.png',
    'fuente-holiday-toro': 'fuente_holiday_toro_1779916180857.png',
    'drew-factory-maduro': 'drew_factory_maduro_1779916201910.png',
    'quorum-classic': 'quorum_classic_1779916213489.png',
    'macanudo-ascot': 'macanudo_ascot_1779916225021.png',
    'ryj-mini': 'ryj_mini_1779916240013.png'
};

const artifactDir = 'C:\\Users\\Remon\\.gemini\\antigravity\\brain\\4bd8a320-6eec-4066-a1d0-83e7a6094289';

async function applyWatermark(sourcePath) {
    const stampPath = path.join(__dirname, 'stamp.png');
    const originalBuffer = fs.readFileSync(sourcePath);
    const original = sharp(originalBuffer);
    const meta = await original.metadata();

    const stampSize = Math.floor(meta.width * 0.4);
    const stampBuffer = await sharp(stampPath).resize({ width: stampSize }).toBuffer();
    const stampMeta = await sharp(stampBuffer).metadata();
    
    const left = Math.floor((meta.width - stampSize) / 2);
    const top = Math.floor((meta.height - stampMeta.height) / 2);
    
    return await original.composite([{
        input: stampBuffer, top, left, blend: 'over'
    }]).png().toBuffer();
}

async function run() {
    const destDir = path.join(__dirname, '..', 'public', 'images', 'products');
    
    console.log("Watermarking 14 unique base images...");
    
    for (const [id, filename] of Object.entries(mappings)) {
        try {
            const sourcePath = path.join(artifactDir, filename);
            const watermarkedBuffer = await applyWatermark(sourcePath);
            const destPath = path.join(destDir, `${id}.png`);
            fs.writeFileSync(destPath, watermarkedBuffer);
            console.log(`Saved watermarked image for ${id}`);
        } catch (e) {
            console.error(`Failed to process ${id}:`, e.message);
        }
    }
    
    console.log("Done applying images!");
}

run();
