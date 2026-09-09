const fs = require('fs');

let content = fs.readFileSync('context/TourContext.js', 'utf8');

const targetStr = `            {
                element: '.tour-view-details-btn', 
                popover: { title: t('details_title'), description: t('details_desc'), side: 'top' },
                actionEvent: 'click',
                causesNavigation: true
            },`;

const replacementStr = `            {
                element: '.tour-view-details-btn', 
                popover: { title: t('details_title'), description: t('details_desc'), side: 'top' },
                actionEvent: 'click',
                causesNavigation: true
            },
            {
                element: '.tour-add-to-cart-btn', 
                popover: { title: t('quick_add_title') || 'Quick Add', description: t('quick_add_desc') || 'Quickly add items to your cart without leaving the page.', side: 'top' },
                actionEvent: 'click',
                causesNavigation: false
            },`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync('context/TourContext.js', content);
    console.log('Added tour step!');
} else {
    console.log('Target string not found in TourContext.js');
}
