const fs = require('fs');
let lines = fs.readFileSync('app/[locale]/shop/page.js', 'utf8').split('\n');

const replacement = [
    '                      <span',
    '                        style={{',
    '                          display: brand.logo ? "none" : "flex",',
    '                          alignItems: "center",',
    '                          justifyContent: "center",',
    '                          width: "100%",',
    '                          height: "100%",',
    '                          color: "#c5a35c",',
    '                          fontWeight: "bold",',
    '                          fontSize: "1rem",',
    '                          fontFamily: "Georgia, serif",',
    '                          textAlign: "center",',
    '                          letterSpacing: "1px",',
    '                        }}',
    '                      >',
    `                        {brand.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase()}`,
    '                      </span>',
];
lines.splice(685, 10, ...replacement);
fs.writeFileSync('app/[locale]/shop/page.js', lines.join('\n'));
console.log('Done');
