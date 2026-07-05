const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    const res = await axios.get('https://images.search.yahoo.com/search/images?p=cohiba+behike+cigar+white+background', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(res.data);
    $('img').each((i, el) => {
        let src = $(el).attr('data-src') || $(el).attr('src');
        if (src && src.startsWith('http')) {
            console.log(src);
        }
    });
}
test().catch(console.error);
