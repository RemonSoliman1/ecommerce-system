const fs = require('fs');
let lines = fs.readFileSync('app/[locale]/shop/page.js', 'utf8').split('\n');

// Find the exact range: from `{brand.logo ? (` to the stray `</span>` after our injected block
// Lines are 0-indexed: line 677 in 1-indexed = index 676
// We need to replace lines 676 to 702 (1-indexed 677-703) with a clean block

const replacement = [
    '                      {brand.logo ? (',
    '                        <img',
    '                          src={brand.logo}',
    '                          alt={brand.name}',
    '                          onError={(e) => {',
    '                            e.target.style.display = "none";',
    '                            e.target.nextSibling.style.display = "flex";',
    '                          }}',
    '                        />',
    '                      ) : null}',
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

// Remove lines 676..702 (indices, 0-based), replace with our block
lines.splice(676, 27, ...replacement);

fs.writeFileSync('app/[locale]/shop/page.js', lines.join('\n'));
console.log('Fixed JSX. New lines 676-705:');
lines.slice(676, 706).forEach((l, i) => console.log((677+i) + ': ' + l));
