const html = require('fs').readFileSync('holts_product.html', 'utf8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);
console.log("Title via h1 span:", $('h1 span').text().trim());
console.log("Title via h1:", $('h1').text().trim());
console.log("Title via page-title:", $('.page-title').text().trim());
