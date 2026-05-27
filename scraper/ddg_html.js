const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const queries = {
    'oliva-journey': 'Oliva 8-Cigar Assortment box',
    'oliva-festive': 'Oliva 12-Cigar Sampler box',
    'oliva-taste': 'Taste of Oliva Sampler',
    'nub-calendar': 'Nub Advent Calendar Sampler',
    'oliva-melanio-2024': 'Oliva Serie V Melanio Edicion Limitada 2024 box',
    'perdomo-connoisseur': 'Perdomo Connoisseur Collection 12 cigars',
    'plasencia-robusto-collection': 'Plasencia Robusto Collection Sampler box',
    'camacho-best-90': 'Camacho Best of the Best sampler',
    'fuente-holiday-robusto': 'Arturo Fuente 5 Robusto Sampler',
    'fuente-holiday-toro': 'Arturo Fuente 5 Toro Sampler',
    'drew-factory-maduro': 'Factory Smokes Maduro bundle',
    'quorum-classic': 'Quorum Classic Bundle',
    'macanudo-ascot': 'Macanudo Cafe Ascot Cigarillos tin',
    'ryj-mini': 'Romeo y Julieta Mini cigarillo tin'
};

async function run() {
    const results = {};
    for (const [id, q] of Object.entries(queries)) {
        try {
            console.log("Searching: " + q);
            const res = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q + ' cigar image')}`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            const $ = cheerio.load(res.data);
            
            // DDG HTML results might not have images directly, wait, they do have small thumbnails?
            // Actually, DuckDuckGo HTML might not have images. 
            // Let's try Yahoo Image search instead! It's less protected.
        } catch (e) {
            console.error(e.message);
        }
    }
}
// run();
