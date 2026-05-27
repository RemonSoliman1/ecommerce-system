const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
    try {
        const query = 'Oliva 8-Cigar Assortment box cigar';
        console.log("Searching DuckDuckGo HTML for:", query);
        
        // Search DDG HTML version
        const res = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        
        const $ = cheerio.load(res.data);
        
        // Find image thumbnails
        // Note: html.duckduckgo.com often just returns links, but let's see if there are thumbnails
        const imgs = [];
        $('img').each((i, el) => {
            const src = $(el).attr('src');
            if (src && src.includes('external-content.duckduckgo.com')) {
                imgs.push(src);
            }
        });
        
        console.log("Found images:", imgs);
        
        if (imgs.length === 0) {
            console.log("No images found. Here is the HTML:");
            console.log(res.data.substring(0, 1000));
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
