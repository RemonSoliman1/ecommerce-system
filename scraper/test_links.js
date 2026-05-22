const axios = require('axios');
const cheerio = require('cheerio');
axios.get('https://www.holts.com/cigars/all-cigar-brands/brand/drew-estate').then(r => {
    const $ = cheerio.load(r.data);
    const links = [];
    $('a').each((i, el) => {
        const link = $(el).attr('href');
        if (link && link.includes('/cigars/all-cigar-brands/') && link.endsWith('.html') && !link.includes('/brand/') && !link.includes('staff-picks') && !link.includes('clearance') && !link.includes('new-arrivals')) {
            links.push(link);
        }
    });
    console.log([...new Set(links)]);
}).catch(e => console.log(e.message));
