const fs = require('fs');
const filePath = 'app/[locale]/shop/page.js';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const replacement = [
    '                      {brand.logo ? (',
    '                        <img',
    '                          src={brand.logo}',
    '                          alt={brand.name}',
    '                          onError={(e) => {',
    '                            e.target.style.display = "none";',
    '                          }}',
    '                        />',
    '                      ) : null}'
];

lines.splice(676, 27, ...replacement);
fs.writeFileSync(filePath, lines.join('\n'));
console.log('JSX updated.');
