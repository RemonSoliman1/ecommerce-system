const fs = require('fs');
let file = 'app/[locale]/globals.css';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('tourPulse')) {
    content += `\n
/* Interactive Tour Element Glow */
.driver-active-element {
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
}
`;
    fs.writeFileSync(file, content);
    console.log('Added tourPulse to globals.css');
}
