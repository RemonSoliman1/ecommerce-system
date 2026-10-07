const https = require('https');
const url = encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/camacho.png');
const proxy = `https://api.allorigins.win/raw?url=${url}`;
https.get(proxy, res => {
    console.log('allorigins:', res.statusCode, res.headers['content-type']);
    let size = 0;
    res.on('data', chunk => size += chunk.length);
    res.on('end', () => console.log('Size:', size));
});
