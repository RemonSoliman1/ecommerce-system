const fs = require('fs');
let file = 'context/TourContext.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /<\/button>\s*<\/div>\s*<\/div>\s*\)\}\s*<\/TourContext\.Provider>/;
const replacement = `                        </button>\n                    </div>\n                </div>\n            </div>\n            )}\n        </TourContext.Provider>`;

content = content.replace(regex, replacement);

content = content.replace(
    /<div style=\{\{ display: 'flex', gap: '10px' \}\}>/g,
    "<div style={{ display: 'flex', gap: '15px', marginTop: '25px', justifyContent: 'center' }}>"
);

fs.writeFileSync(file, content);
console.log('Fixed TourContext again');
