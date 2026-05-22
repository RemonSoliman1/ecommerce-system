const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('holts_product.html', 'utf8');
const $ = cheerio.load(html);

const rows = [];
$('table.products-list-table tr').each((i, el) => {
    rows.push($(el).text().replace(/\s+/g, ' ').trim());
});
console.log(rows.slice(0, 5));
