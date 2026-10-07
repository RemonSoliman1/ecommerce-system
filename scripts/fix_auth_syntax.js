const fs = require('fs');

function fixPage(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if missing closing fragment
    if (content.includes('return (\n        <>') && !content.includes('</>\n    );\n}')) {
        content = content.replace(/<\/div>\s*\);\s*\}/, '</div>\n        </>\n    );\n}');
        fs.writeFileSync(file, content);
    }
}

fixPage('app/[locale]/login/page.js');
fixPage('app/[locale]/register/page.js');
console.log('Fixed auth pages');
