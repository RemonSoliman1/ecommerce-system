const fs = require('fs');

function fixHover(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace translateY(-5px) with box-shadow
    if (content.includes('transform: translateY(-5px);')) {
        content = content.replace('transform: translateY(-5px);', 'box-shadow: 0 8px 30px rgba(197, 163, 92, 0.15);');
        fs.writeFileSync(file, content);
        console.log('Fixed hover in ' + file);
    }
}

fixHover('app/[locale]/page.module.css');
fixHover('app/[locale]/shop/shop.module.css');
