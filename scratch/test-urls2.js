const https = require('https');

// Try Wikipedia / Wikimedia Commons for SVG logos (reliable, publicly licensed)
const testUrls = [
    'https://upload.wikimedia.org/wikipedia/commons/6/62/Camacho_Cigars.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Camacho_Cigars_logo.svg/200px-Camacho_Cigars_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Cohiba_logo.svg/200px-Cohiba_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Montecristo_cigar_logo.svg/200px-Montecristo_cigar_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/en/6/6a/Arturo_Fuente_logo.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Padron-cigars-logo.svg/200px-Padron-cigars-logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/XIKAR_logo.svg/200px-XIKAR_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Davidoff_logo.svg/200px-Davidoff_logo.svg.png',
    'https://logowik.com/content/uploads/images/camacho-cigars7434.logowik.com.webp',
    'https://logowik.com/content/uploads/images/cohiba9547.logowik.com.webp',
    'https://logowik.com/content/uploads/images/davidoff-cigars1342.logowik.com.webp',
    'https://logowik.com/content/uploads/images/oliva-cigars7328.logowik.com.webp',
    'https://logowik.com/content/uploads/images/padron-cigars8623.logowik.com.webp',
    'https://www.brandsoftheworld.com/sites/default/files/0019/0000/brand.gif',
    'https://seeklogo.com/images/C/camacho-cigars-logo-B1D42B7CC7-seeklogo.com.png',
];

for (const url of testUrls) {
    const req = https.get(url, {
        headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/webp,image/png,image/*,*/*;q=0.8'
        },
        timeout: 8000
    }, (res) => {
        console.log(url.substring(0, 70).padEnd(70), '-> Status:', res.statusCode, '|', res.headers['content-type']?.substring(0, 25));
        res.destroy();
    });
    req.on('error', e => console.log(url.substring(0, 70).padEnd(70), '-> Error:', e.message));
    req.on('timeout', () => { req.destroy(); console.log(url.substring(0, 70).padEnd(70), '-> Timeout'); });
}
