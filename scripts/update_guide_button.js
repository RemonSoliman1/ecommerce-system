const fs = require('fs');
let file = 'components/account/UserGuide.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'const { startTour } = useTour();',
    `const { startTour } = useTour();
    const resetTours = () => {
        localStorage.removeItem('cigar_tour_home_done');
        localStorage.removeItem('cigar_tour_shop_done');
        localStorage.removeItem('cigar_tour_product_done');
        localStorage.removeItem('cigar_tour_account_done');
        window.location.href = '/';
    };`
);

content = content.replace(
    'onClick={startTour}',
    'onClick={resetTours}'
);

content = content.replace(
    "{t('start_tour')}",
    "{t('start_tour') || 'Restart Interactive Tours'}"
);

fs.writeFileSync(file, content);
console.log('Updated UserGuide button');
