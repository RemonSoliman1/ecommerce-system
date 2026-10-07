const fs = require('fs');
let file = 'context/TourContext.js';
let content = fs.readFileSync(file, 'utf8');

// Inside onPopoverRender
content = content.replace(
    /onPopoverRender: \(popover, \{ config, state \}\) => \{/g,
    `onPopoverRender: (popover, { config, state }) => {
                document.querySelectorAll('.tour-glow').forEach(el => el.classList.remove('tour-glow'));
                const currentStep = state.activeStep;
                if (currentStep && currentStep.element) {
                    const el = document.querySelector(currentStep.element);
                    if (el) el.classList.add('tour-glow');
                }`
);

// Inside onCloseClick and onDestroyed
content = content.replace(
    /onDestroyed: \(\) => \{/g,
    `onDestroyed: () => {
                document.querySelectorAll('.tour-glow').forEach(el => el.classList.remove('tour-glow'));`
);

content = content.replace(
    /onCloseClick: \(\) => \{/g,
    `onCloseClick: () => {
                document.querySelectorAll('.tour-glow').forEach(el => el.classList.remove('tour-glow'));`
);

fs.writeFileSync(file, content);
console.log('Added tour-glow logic to TourContext');
