const fs = require('fs');
let file = 'context/TourContext.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    '<TourContext.Provider value={{ startTour, isTourActive }}>',
    '<TourContext.Provider value={{ startTour, isTourActive, pendingTour }}>'
);

fs.writeFileSync(file, content);
console.log('Exposed pendingTour in TourContext');
