const fs = require('fs');
let file = 'app/[locale]/page.js';
let content = fs.readFileSync(file, 'utf8');

// Replace the last 3 closing divs and add </>
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/, '</div>\n      </div>\n    </div>\n    </>\n  );\n}');

fs.writeFileSync(file, content);
console.log('Fixed page.js syntax via Regex');
