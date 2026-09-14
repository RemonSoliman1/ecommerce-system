const fs = require('fs');
let file = 'app/[locale]/page.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /const prevSlide = \(\) => setCurrentSlide\(\(prev\) => \(prev === 0 \? slides\.length - 1 : prev - 1\)\);\s*return \(\s*<div className=\{styles\.home\}>/;

const replacement = `const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  return (
    <>
      <TourTrigger 
          tourName="home"
          steps={[
              { element: '#tour-search', titleKey: 'home_search_title', descKey: 'home_search_desc', side: 'bottom' },
              { element: '#tour-shop', titleKey: 'home_shop_title', descKey: 'home_shop_desc', side: 'bottom' },
              { element: '.tour-home-hero', titleKey: 'home_hero_title', descKey: 'home_hero_desc', side: 'bottom' },
              { element: '.tour-home-featured', titleKey: 'home_featured_title', descKey: 'home_featured_desc', side: 'top' },
              { element: '.tour-home-brands', titleKey: 'home_brands_title', descKey: 'home_brands_desc', side: 'top' }
          ]}
      />
      <div className={styles.home}>`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    // Also we need to make sure the end of the return statement has </>
    if (!content.includes('</>')) {
        content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\);\s*}/, '</div></div></div></>);\n}');
    }
    fs.writeFileSync(file, content);
    console.log('Injected Home Tour');
} else {
    console.error('Could not find target to inject Home Tour');
}
