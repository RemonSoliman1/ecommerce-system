const fs = require('fs');

const URL_MAP = {
    '20-acre-farm': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/20-acre-farm.png',
    'acid': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/acid.png',
    'alec-bradley': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/alec-bradley.png',
    'arturo-fuente': 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Arturo_Fuente_logo.svg',
    'ashton': 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Ashton_Cigars_logo.svg',
    'audew': 'https://m.media-amazon.com/images/S/stores-image-uploads-na-prod/e/AmazonStores/ATVPDKIKX0DER/8126b856-11f4-411a-82ee-06b29f7902ba.jpg',
    'avo': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/avo.png',
    'blackened': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/blackened.png',
    'camacho': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Camacho_Cigars_logo.svg',
    'cao': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/cao.png',
    'chateau-diadem': 'https://www.chateaudiadem.com/wp-content/uploads/2023/04/Chateau-Diadem-Logo.svg',
    'cohiba': 'https://upload.wikimedia.org/wikipedia/en/3/33/Cohiba_logo.svg',
    'davidoff': 'https://upload.wikimedia.org/wikipedia/commons/0/06/Davidoff_logo.svg',
    'deadwood': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/deadwood.png',
    'drew-estate': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/drew-estate.png',
    'ep-carrillo': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/ep-carrillo.png',
    'e-p-carrillo': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/ep-carrillo.png',
    'oliva': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/oliva.png',
    'romeo-y-julieta': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Romeo_y_Julieta_cigar_logo.svg',
    'montecristo': 'https://upload.wikimedia.org/wikipedia/commons/5/57/Montecristo_cigar_logo.svg',
    'padron': 'https://upload.wikimedia.org/wikipedia/commons/6/63/Padron-cigars-logo.svg',
    'h-upmann': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/H_Upmann_Logo.svg',
    'xikar': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/XIKAR_logo.svg',
    'macanudo': 'https://upload.wikimedia.org/wikipedia/commons/4/41/Macanudo_Logo.svg',
    'partagas': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Partagas_logo.svg',
    'liga-privada': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/liga-privada.png',
    'kentucky-fire-cured': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/kentucky-fire-cured.png',
    'java': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/java.png',
    'herrera-esteli': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/herrera-esteli.png',
    'la-aroma-de-cuba': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/la-aroma-de-cuba.png',
    'pappy-van-winkle': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/pappy-van-winkle.png',
    'nica-rustica': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/nica-rustica.png',
    'padilla': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/padilla.png',
    'zino': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/zino.png',
    'punch': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/punch.png',
    'gurkha-cigars': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/gurkha.png',
    'my-father': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/my-father.png',
    'el-septimo': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/el-septimo.png',
    'factory-smokes': 'https://www.cigarpage.com/media/wysiwyg/brand-logos/factory-smokes.png'
};

const dataPath = 'lib/data.js';
let content = fs.readFileSync(dataPath, 'utf8');

let updatedCount = 0;
// First, if they are already pointing to proxy or http, revert them to base for a clean pass.
// This is to avoid double-proxying if the script is run multiple times.
// Note: they should be pointing to /images/brands/slug.png currently because of our last revert.

content = content.replace(/logo:\s*'\/images\/brands\/([^/.]+)\.(png|jpg|svg)'/g, (match, slug) => {
    if (URL_MAP[slug]) {
        updatedCount++;
        return `logo: '/api/image-proxy?url=' + encodeURIComponent('${URL_MAP[slug]}')`;
    }
    return match; 
});

content = content.replace(/logo:\s*'\/images\/brands\/fallback\.png'/g, `logo: ''`);

fs.writeFileSync(dataPath, content);
console.log('Updated ' + updatedCount + ' logos to use the image proxy API.');
