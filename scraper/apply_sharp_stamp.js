const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises'); // Use native fs.promises
const { existsSync } = require('fs');

async function processDirectory(dirPath, stampBuffer) {
    if (!existsSync(dirPath)) return;
    
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            await processDirectory(fullPath, stampBuffer);
        } else if (entry.isFile() && (entry.name.endsWith('.jpg') || entry.name.endsWith('.png') || entry.name.endsWith('.webp')) && entry.name !== 'favicon.png') {
            try {
                // To avoid reading/writing to the same file simultaneously, buffer it first
                const originalBuffer = await fs.readFile(fullPath);
                const metadata = await sharp(originalBuffer).metadata();
                
                const w = metadata.width;
                const h = metadata.height;
                
                if (w > 250 && h > 250) {
                    const stampSize = Math.floor(w * 0.4);
                    const resizedStamp = await sharp(stampBuffer).resize({ width: stampSize }).toBuffer();
                    
                    const stampMeta = await sharp(resizedStamp).metadata();
                    
                    const left = Math.floor((w - stampSize) / 2);
                    const top = Math.floor((h - stampMeta.height) / 2);
                    
                    const composited = await sharp(originalBuffer)
                        .composite([{
                            input: resizedStamp,
                            top,
                            left,
                            blend: 'over'
                        }])
                        .toFormat(metadata.format === 'png' ? 'png' : 'jpeg') // Keep original format if possible
                        .toBuffer();
                        
                    await fs.writeFile(fullPath, composited);
                    console.log(`Stamped: ${fullPath}`);
                }
            } catch (e) {
                console.log(`Skipped/Error on ${fullPath}:`, e.message);
            }
        }
    }
}

async function runSweep() {
    console.log("Starting massive image watermark sweep...");
    const stampPath = path.join(__dirname, 'stamp.png');
    if (!existsSync(stampPath)) {
        console.error("Stamp not found!");
        return;
    }
    const stampBuffer = await fs.readFile(stampPath);
    
    const imagesDir = path.join(__dirname, '..', 'public', 'images');
    
    await processDirectory(path.join(imagesDir, 'cigars'), stampBuffer);
    await processDirectory(path.join(imagesDir, 'brands'), stampBuffer);
    await processDirectory(path.join(imagesDir, 'products'), stampBuffer);
    
    console.log("Sweep complete!");
}

runSweep();
