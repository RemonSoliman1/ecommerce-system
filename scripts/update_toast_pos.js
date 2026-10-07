const fs = require('fs');
let file = 'context/ToastContext.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /position: 'fixed',\s*top: '20px',\s*right: '20px',/g,
    "position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',"
);

content = content.replace(
    /from \{ transform: translateX\(100\%\); opacity: 0; \}/g,
    "from { transform: scale(0.9); opacity: 0; }"
);
content = content.replace(
    /to \{ transform: translateX\(0\); opacity: 1; \}/g,
    "to { transform: scale(1); opacity: 1; }"
);

fs.writeFileSync(file, content);
console.log('Updated Toast position to center');
