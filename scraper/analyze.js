const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('famous_source.html', 'utf8');
const $ = cheerio.load(html);

// Famous smoke product items usually have a class like product-item, item, etc.
const products = [];
$('.product-item-info, .product-item, .item.product').each((i, el) => {
    const title = $(el).find('.product-item-link, .product-name').text().trim();
    const link = $(el).find('.product-item-link, .product-item-photo').attr('href');
    const image = $(el).find('.product-image-photo').attr('src');
    const price = $(el).find('.price').first().text().trim();
    
    if (title || link) {
        products.push({ title, link, image, price });
    }
});

console.log(products.slice(0, 10));
console.log('Total found:', products.length);
