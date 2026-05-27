const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Create an HTTPS agent that ignores cert errors
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// 1. Try to use alternative URLs that are less likely to block (Shopify, generic image hosts)
const urls = {
    'nub-calendar': 'https://mycigars.ru/img/Advent-Calendar-2022.webp', // SSL bypass
    'plasencia-robusto-collection': 'https://cdn.shopify.com/s/files/1/0268/6630/3055/products/plasencia-robusto-collection-sampler.jpg', // shopify
    'fuente-holiday-toro': 'https://cdn11.bigcommerce.com/s-640a4/images/stencil/1280x1280/products/4397/11676/arturo-fuente-sangre-de-toro-sampler__06209.1656536122.jpg', // bigcommerce
    // Let's use Wikipedia or generic for others? 
    // I'll try generating images if they fail.
};

async function run() {
    for (const [id, url] of Object.entries(urls)) {
        try {
            console.log(`Downloading ${id}...`);
            const res = await axios({
                url, responseType: 'arraybuffer',
                httpsAgent,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            fs.writeFileSync(`${id}_test.png`, res.data);
            console.log(`Success ${id}`);
        } catch (e) {
            console.log(`Fail ${id}: ${e.message}`);
        }
    }
}
run();
