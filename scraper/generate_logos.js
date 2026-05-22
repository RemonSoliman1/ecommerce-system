const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Manually extract brand info since requiring ES6 data.js is tricky in node
const brands = [
    { id: 'alec-bradley', name: 'Alec Bradley', file: 'alec-bradley.png' },
    { id: 'cao', name: 'CAO', file: 'cao.png' },
    { id: 'punch', name: 'Punch', file: 'punch.png' },
    { id: 'gurkha-cigars', name: 'Gurkha', file: 'gurkha-cigars.png' },
    { id: 'san-cristobal', name: 'San Cristobal', file: 'san-cristobal.png' },
    { id: 'avo', name: 'AVO', file: 'avo.png' },
    { id: 'padilla', name: 'Padilla', file: 'padilla.png' },
    { id: 'h-upmann', name: 'H. Upmann', file: 'h-upmann.png' },
    { id: 'zino', name: 'Zino', file: 'zino.png' },
    { id: 'el-septimo', name: 'El Septimo', file: 'el-septimo.png' },
    { id: 'chateau-diadem', name: 'Chateau Diadem', file: 'chateau-diadem.png' },
    { id: 'e-p-carrillo', name: 'E.P. Carrillo', file: 'e-p-carrillo.png' },
    { id: 'audew', name: 'Audew', file: 'audew.png' },
    { id: 'habanos', name: 'Habanos S.A.', file: 'cohiba.png' },
    { id: 'factory', name: 'Factory Bundles', file: 'padron.png' },
    { id: 'kentucky-fire-cured', name: 'Kentucky Fire Cured', file: 'kfc.png' },
    { id: 'pappy-van-winkle', name: 'Pappy Van Winkle', file: 'pappy.png' },
    { id: 'nica-rustica', name: 'Nica Rustica', file: 'nica.png' },
    { id: 'the-egg', name: 'The Egg', file: 'egg.png' },
    { id: 'blackened', name: 'Blackened', file: 'blackened.png' },
    { id: '20-acre-farm', name: '20 Acre Farm', file: '20acre.png' },
    { id: 'isla-del-sol', name: 'Isla del Sol', file: 'java.png' },
    { id: 'camacho', name: 'Camacho', file: 'camacho.png' },
    { id: 'davidoff', name: 'Davidoff', file: 'davidoff.png' },
    { id: 'std', name: 'S.T. Dupont', file: 'std.png' },
    { id: 'xikar', name: 'Xikar', file: 'xikar.png' },
    { id: 'elie-bleu', name: 'Elie Bleu', file: 'eliebleu.png' },
    { id: 'newair', name: 'NewAir', file: 'newair.png' }
];

async function generateMissingLogos() {
    console.log("Generating missing premium logos...");
    for (const b of brands) {
        const dest = path.join(__dirname, '..', 'public', 'images', 'brands', b.file);
        
        // Ensure directory exists
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // If it DOES NOT exist, generate one
        if (!fs.existsSync(dest)) {
            console.log("Generating missing logo for: " + b.name);
            
            const w = 400;
            const h = 200;
            
            // Create SVG text overlay
            const svgText = `
            <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#111111" />
                <rect width="380" height="180" x="10" y="10" fill="none" stroke="#aa8c4c" stroke-width="2" />
                <text x="50%" y="55%" font-family="Georgia, serif" font-size="${b.name.length > 12 ? 26 : 32}" fill="#ffffff" font-weight="bold" text-anchor="middle" alignment-baseline="middle" letter-spacing="2">${b.name}</text>
            </svg>
            `;
            
            await sharp(Buffer.from(svgText))
                .png()
                .toFile(dest);
        }
    }
    console.log("Finished generating all missing logos!");
}

generateMissingLogos();
