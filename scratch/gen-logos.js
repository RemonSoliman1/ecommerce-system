/**
 * generate-brand-logos.js
 * Generates clean, professional brand logo placeholders using sharp.
 * Creates a warm ivory circle with the brand name in elegant typography.
 * These will look identical to real logos in terms of sizing/fit.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'brands');

// All brands: [filename_slug, display_name, bg_color, text_color, font_weight]
const BRANDS = [
    // Filename slug       Display name          BG hex    Text hex   Bold?  Abbrev?
    ['camacho',           'CAMACHO',             '1a0a00', 'c5a35c',  true,  false],
    ['cohiba',            'COHIBA',              '0a0a0a', 'e8c96e',  true,  false],
    ['davidoff',          'DAVIDOFF',            '1c1c1c', 'b8a882',  true,  false],
    ['montecristo',       'MONTE\nCRISTO',       '1a1200', 'c8a84e',  true,  true ],
    ['ryj',               'ROMEO\nY JULIETA',    '8b0000', 'ffd700',  true,  true ],
    ['padron',            'PADRÓN',              '1a0a00', 'c5a35c',  true,  false],
    ['oliva',             'OLIVA',               '2a1a00', 'c8b06a',  true,  false],
    ['rocky-patel',       'ROCKY\nPATEL',        '0a0a0a', 'c5a35c',  true,  true ],
    ['ashton',            'ASHTON',              'f5f0e8', '1a0a00',  true,  false],
    ['cao',               'CAO',                 '0a0a1a', 'e8c96e',  true,  false],
    ['alec-bradley',      'ALEC\nBRADLEY',       '0a1a0a', 'c5d88a',  true,  true ],
    ['fuente',            'ARTURO\nFUENTE',      '8b0000', 'ffd700',  true,  true ],
    ['acid',              'ACID',                '0a001a', 'c084fc',  true,  false],
    ['avo',               'AVO',                 'f5f0e8', '1a0a00',  true,  false],
    ['blackened',         'BLACKENED',           '0a0a0a', 'c0c0c0',  true,  false],
    ['my-father',         'MY\nFATHER',          '1a0a00', 'c5a35c',  true,  true ],
    ['h-upmann',          'H. UPMANN',           'f5f0e8', '1a0a00',  true,  false],
    ['gurkha-cigars',     'GURKHA',              '1a0a00', 'c5a35c',  true,  false],
    ['liga',              'LIGA\nPRIVADA',       '0a0a0a', 'c5a35c',  true,  true ],
    ['el-septimo',        'EL\nSEPTIMO',         '1a1200', 'e8c96e',  true,  true ],
    ['xikar',             'XIKAR',               '0a0a1a', 'c5a35c',  true,  false],
    ['punch',             'PUNCH',               '8b0000', 'ffd700',  true,  false],
    ['20acre',            '20 ACRE\nFARM',       '1a2a0a', 'a8c870',  true,  true ],
    ['kfc',               'KENTUCKY\nFIRE CURED','1a0a00', 'e8602a',  true,  true ],
    ['java',              'JAVA',                '1a0a00', 'c87040',  true,  false],
    ['herrera',           'HERRERA\nESTELÍ',     '0a0a0a', 'c5a35c',  true,  true ],
    ['deadwood',          'DEADWOOD',            '1a1200', 'c87828',  true,  false],
    ['la-aroma-de-cuba',  'LA AROMA\nDE CUBA',   '8b0000', 'ffd700',  true,  true ],
    ['pappy',             'PAPPY\nVAN WINKLE',   '1a0a00', 'c5a35c',  true,  true ],
    ['nica',              'NICA\nRUSTICA',       '1a2a0a', 'a8c870',  true,  true ],
    ['e-p-carrillo',      'E.P.\nCARRILLO',      '0a0a1a', 'c5a35c',  true,  true ],
    ['san-cristobal',     'SAN\nCRISTÓBAL',      '1a0a00', 'c5a35c',  true,  true ],
    ['padilla',           'PADILLA',             '0a0a1a', 'c5a35c',  true,  false],
    ['zino',              'ZINO',                'f5f0e8', '1a0a00',  true,  false],
    ['egg',               'THE EGG',             '1a0a00', 'c5a35c',  true,  false],
    ['std',               'S.T.\nDUPONT',        'f5f0e8', '1a0a00',  true,  true ],
    ['eliebleu',          'ELIE\nBLEU',          'f5f0e8', '1a0a00',  true,  true ],
    ['newair',            'NEWAIR',              '0a0a1a', '6aabe8',  true,  false],
    ['audew',             'AUDEW',               '0a0a1a', '6aabe8',  true,  false],
    ['chateau-diadem',    'CHATEAU\nDIADEM',     '1a1200', 'e8c96e',  true,  true ],
    ['factory',           'FACTORY\nSMOKES',     '1a0a00', 'c5a35c',  true,  true ],
];

// Generate SVG text for a brand
function makeSvg(displayName, bgHex, textHex, isMultiLine) {
    const SIZE = 300;
    const RADIUS = 145;
    const CX = 150;
    const CY = 150;

    const lines = displayName.split('\n');
    const fontSize = lines.length > 1 ? (isMultiLine ? 28 : 32) : 38;
    const lineHeight = fontSize * 1.25;
    const totalHeight = lines.length * lineHeight;
    const startY = CY - totalHeight / 2 + lineHeight * 0.75;

    const textEls = lines.map((line, i) => {
        const y = startY + i * lineHeight;
        return `<text x="${CX}" y="${y}" text-anchor="middle" dominant-baseline="middle"
            font-family="'Georgia', 'Times New Roman', serif"
            font-size="${fontSize}"
            font-weight="700"
            letter-spacing="2"
            fill="#${textHex}">${line}</text>`;
    }).join('\n        ');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <defs>
        <clipPath id="circle">
            <circle cx="${CX}" cy="${CY}" r="${RADIUS}"/>
        </clipPath>
    </defs>
    <!-- Background -->
    <circle cx="${CX}" cy="${CY}" r="${RADIUS}" fill="#${bgHex}"/>
    <!-- Decorative ring -->
    <circle cx="${CX}" cy="${CY}" r="${RADIUS - 6}" fill="none" stroke="#${textHex}" stroke-width="1.5" opacity="0.4"/>
    <!-- Brand text -->
    ${textEls}
</svg>`;
}

async function main() {
    let count = 0;
    for (const [slug, name, bg, text, bold, multi] of BRANDS) {
        const outPath = path.join(OUT_DIR, `${slug}.png`);
        const svgStr = makeSvg(name, bg, text, multi);
        const svgBuf = Buffer.from(svgStr, 'utf8');

        try {
            await sharp(svgBuf, { density: 150 })
                .resize(300, 300)
                .png({ compressionLevel: 9 })
                .toFile(outPath);
            console.log(`✓ ${slug}.png`);
            count++;
        } catch (e) {
            console.log(`✗ ${slug}: ${e.message}`);
        }
    }
    console.log(`\nDone: ${count}/${BRANDS.length} logos generated`);
}

main().catch(console.error);
