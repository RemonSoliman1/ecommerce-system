const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const mappings = {
    'oliva-journey': 'sampler',
    'oliva-festive': 'sampler',
    'oliva-taste': 'sampler',
    'nub-calendar': 'sampler',
    'oliva-melanio-2024': 'sampler',
    'perdomo-connoisseur': 'sampler',
    'plasencia-robusto-collection': 'sampler',
    'camacho-best-90': 'sampler',
    'fuente-holiday-robusto': 'sampler',
    'fuente-holiday-toro': 'sampler',
    'drew-factory-maduro': 'bundle',
    'quorum-classic': 'bundle',
    'macanudo-ascot': 'cigarillo',
    'ryj-mini': 'cigarillo'
};

const artifactDir = 'C:\\Users\\Remon\\.gemini\\antigravity\\brain\\4bd8a320-6eec-4066-a1d0-83e7a6094289';

const sourceFiles = {
    'sampler': path.join(artifactDir, 'generic_sampler_1779840017055.png'),
    'bundle': path.join(artifactDir, 'generic_bundle_1779840030361.png'),
    'cigarillo': path.join(artifactDir, 'generic_cigarillo_1779840044825.png')
};

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
    
    // Pre-calculate the 3 watermarked buffers so we don't do it 14 times
    console.log("Watermarking base images...");
    const watermarkedBuffers = {
        'sampler': await applyWatermark(sourceFiles['sampler']),
        'bundle': await applyWatermark(sourceFiles['bundle']),
        'cigarillo': await applyWatermark(sourceFiles['cigarillo'])
    };
    
    for (const [id, type] of Object.entries(mappings)) {
        const destPath = path.join(destDir, `${id}.png`);
        fs.writeFileSync(destPath, watermarkedBuffers[type]);
        console.log(`Saved watermarked image for ${id} (type: ${type})`);
    }
    
    console.log("Done applying images!");
}

run();
