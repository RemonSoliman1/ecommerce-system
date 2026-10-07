const fs = require('fs');
let lines = fs.readFileSync('app/[locale]/admin/page.js', 'utf8').split('\n');
lines[1386] = lines[1386].replace('UPLOAD IMAGES', 'UPLOAD MEDIA');
lines[1389] = lines[1389].replace('image/*', 'image/*,video/mp4,video/webm,video/quicktime');
fs.writeFileSync('app/[locale]/admin/page.js', lines.join('\n'));
console.log('Fixed');
