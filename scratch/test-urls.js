const https = require('https');

const testUrls = [
    'https://www.cigarpage.com/media/wysiwyg/brand-logos/camacho.png',
    'https://www.smokingpipes.com/img/brand-logos/camacho.png',
    'https://cigars.com/media/catalog/brand/cache/camacho.png',
    'https://www.cigarbid.com/Content/Images/Brands/camacho-logo.png',
    'https://www.tobaccoreviews.com/images/brand_logos/camacho.gif',
    'https://www.holts.com/media/logo/stores/1/camacho_logo.png',
    'https://cf.shopee.com.my/file/camacho-cigar-logo',
];

for (const url of testUrls) {
    const req = https.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.google.com/' },
        timeout: 8000
    }, (res) => {
        console.log(url.substring(30), '-> Status:', res.statusCode, 'Type:', res.headers['content-type'], 'Size:', res.headers['content-length']);
        res.destroy();
    });
    req.on('error', e => console.log(url.substring(30), '-> Error:', e.message));
    req.on('timeout', () => { req.destroy(); console.log(url.substring(30), '-> Timeout'); });
}
