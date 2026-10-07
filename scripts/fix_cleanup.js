const fs = require('fs');
let file = 'context/TourContext.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /onCloseClick:\s*\(\)\s*=>\s*\{/g,
    `onCloseClick: () => {
                document.querySelectorAll('.tour-glow').forEach(el => el.classList.remove('tour-glow'));`
);

content = content.replace(
    /onDestroyed:\s*\(\)\s*=>\s*\{/g,
    `onDestroyed: () => {
                document.querySelectorAll('.tour-glow').forEach(el => el.classList.remove('tour-glow'));`
);

fs.writeFileSync(file, content);
console.log('Added cleanup logic');
