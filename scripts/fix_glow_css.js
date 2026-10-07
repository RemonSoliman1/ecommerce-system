const fs = require('fs');
let file = 'app/[locale]/globals.css';
let content = fs.readFileSync(file, 'utf8');

const oldCss = `/* Interactive Tour Element Glow */
.tour-glow {
    outline: 2px solid rgba(197, 163, 92, 0.8) !important;
    animation: tourPulse 1.2s infinite alternate !important;
    border-radius: inherit; /* Tries to match the underlying element's border radius */
}

@keyframes tourPulse {
    0% {
        outline-color: rgba(197, 163, 92, 0.3);
        outline-offset: 0px;
        box-shadow: 0 0 5px rgba(197, 163, 92, 0.3);
    }
    100% {
        outline-color: rgba(197, 163, 92, 1);
        outline-offset: 6px;
        box-shadow: 0 0 20px rgba(197, 163, 92, 0.8);
    }
}`;

const newCss = `/* Interactive Tour Element Glow */
.tour-glow {
    animation: tourPulse 1.2s infinite alternate !important;
    position: relative;
    z-index: 10000;
}

@keyframes tourPulse {
    0% {
        box-shadow: 0 0 5px 2px rgba(197, 163, 92, 0.4), inset 0 0 5px rgba(197, 163, 92, 0.2);
    }
    100% {
        box-shadow: 0 0 15px 4px rgba(197, 163, 92, 0.9), inset 0 0 10px rgba(197, 163, 92, 0.4);
    }
}`;

content = content.replace(oldCss, newCss);

fs.writeFileSync(file, content);
console.log('Fixed tour-glow css');
