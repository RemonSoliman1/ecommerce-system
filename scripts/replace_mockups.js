const fs = require('fs');
let file = 'app/[locale]/page.js';
let content = fs.readFileSync(file, 'utf8');

// Replace defaultMosaics
content = content.replace(
    /const defaultMosaics = \[\s*\{ title: 'CHATEAU COLLECTION', img: '\/images\/mockups\/category_boxes_1775244000386\.png', link: '\/shop\?type=cigar' \},\s*\{ title: 'VINTAGE DOMINIC', img: '\/images\/mockups\/category_samplers_1775244026153\.png', link: '\/shop\?type=sampler' \},\s*\{ title: 'PREMIUM', img: '\/images\/mockups\/category_accessories_1775244042649\.png', link: '\/shop\?type=accessory' \}\s*\];/,
    `const defaultMosaics = [
      { title: 'CUBAN COLLECTION', img: '/images/cigars/cohiba-behike.png', link: '/shop?origin=Cuba' },
      { title: 'VINTAGE SAMPLERS', img: '/images/cigars/habanos-sampler-.jpg', link: '/shop?type=sampler' },
      { title: 'PREMIUM ACCESSORIES', img: '/images/cigars/elie-bleu-humidor-.jpg', link: '/shop?type=accessory' }
    ];`
);

// Replace heroBackgrounds
content = content.replace(
    /const heroBackgrounds = \[\s*'\/images\/mockups\/hero_banner_2_1775244061348\.png',\s*'\/images\/mockups\/hero_banner_1_1775243968234\.png',\s*'\/images\/mockups\/category_boxes_1775244000386\.png'\s*\];/,
    `const heroBackgrounds = [
          '/images/cigars/cohiba-cohiba.jpg', 
          '/images/cigars/opusx.png',
          '/images/cigars/davido-winston.png'
        ];`
);

// Replace whoWeAreImage
content = content.replace(
    /url\('\/images\/mockups\/who_we_are_1775243983842\.png'\)/,
    `url('/images/cigars/arturo-fuente-fuente-o.jpg')`
);

// In hero mapping, use product.image instead of hardcoded heroBackgrounds if available
content = content.replace(
    /img: heroBackgrounds\[index\] \|\| product\.image,/,
    `img: product.image || heroBackgrounds[index],`
);

fs.writeFileSync(file, content);
console.log('Replaced mockups in page.js');
