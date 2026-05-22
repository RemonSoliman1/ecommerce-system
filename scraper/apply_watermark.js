const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const CIGAR_DIR = path.join(__dirname, '..', 'public', 'images', 'cigars');
const BRAND_DIR = path.join(__dirname, '..', 'public', 'images', 'brands');

async function processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await processDirectory(fullPath);
        } else if (file.match(/\.(jpg|jpeg|png)$/i)) {
            console.log(`Watermarking ${file}...`);
            await watermarkImage(fullPath);
        }
    }
}

async function watermarkImage(filePath) {
    try {
        const image = await Jimp.read(filePath);
        
        // 32px or 64px depending on image size
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        const w = image.bitmap.width;
        const h = image.bitmap.height;
        
        // Only watermark if image is decently sized
        if (w < 100 || h < 100) return;
        
        const text = "CIGAR LOUNGE";
        const textWidth = Jimp.measureText(font, text);
        const textHeight = Jimp.measureTextHeight(font, text, w);

        // We will create a small transparent canvas, write text, rotate, and blit
        const textImage = new Jimp(textWidth + 20, textHeight + 20, 0x00000000);
        textImage.print(font, 10, 10, {
            text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        });
        
        // Rotate 45 degrees
        textImage.rotate(-45);
        
        // Composite it with 50% opacity
        textImage.opacity(0.35); // 35% visible so it doesn't overtalk
        
        // Place it dead center
        const xPos = (w / 2) - (textImage.bitmap.width / 2);
        const yPos = (h / 2) - (textImage.bitmap.height / 2);
        
        image.composite(textImage, xPos, yPos, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 1.0,
            opacityDest: 1.0
        });

        // Also add small corner bounds just for security
        const smallFont = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
        const smallTextImg = new Jimp(200, 30, 0x00000000);
        smallTextImg.print(smallFont, 0, 0, text).opacity(0.4);
        
        image.composite(smallTextImg, 10, h - 30);
        
        await image.writeAsync(filePath);
    } catch (e) {
         console.error(`Failed on ${filePath}`, e.message);
    }
}

async function run() {
    console.log("Starting massive watermarking sweep...");
    await processDirectory(CIGAR_DIR);
    console.log("Finished sweeping cigars!");
    await processDirectory(BRAND_DIR);
    console.log("Finished sweeping brands!");
    console.log("Update Complete.");
}

run();
