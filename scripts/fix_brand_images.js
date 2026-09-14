const fs = require('fs');
const path = require('path');

const brandsDir = path.join(__dirname, '../public/images/brands');
const missing = [
    'acid.png', 'fuente.png', 'deadwood.png', 'la-aroma-de-cuba.png', 
    'factory.png', 'herrera.png', 'my-father.png', 'oliva.png', 
    'rocky-patel.png', 'liga.png'
];

const source = path.join(brandsDir, 'ryj.png');

if (fs.existsSync(source)) {
    missing.forEach(img => {
        const target = path.join(brandsDir, img);
        if (!fs.existsSync(target)) {
            // Check if there is a directory with the same name, if so we need to either delete it or name the image differently, but since they are images let's just make sure.
            if (fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
                console.log('Skipping because it is a directory:', target);
            } else {
                fs.copyFileSync(source, target);
                console.log('Copied ryj.png to', img);
            }
        }
    });
} else {
    console.error('Source ryj.png not found!');
}
