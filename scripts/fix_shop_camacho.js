const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add isTourActive state
content = content.replace(
    /const promoFilter = searchParams\.get\("promo"\) === "true";/,
    `const promoFilter = searchParams.get("promo") === "true";

    const [isTourActive, setIsTourActive] = useState(false);
    useEffect(() => {
        setIsTourActive(document.cookie.includes('cigar_global_tour_active=true') || window.location.href.includes('cigar_tour_active=true'));
    }, []);`
);

// 2. Modify the end of filteredProducts
content = content.replace(
    /return filtered\.sort\(\(a, b\) => \{/,
    `let sorted = filtered.sort((a, b) => {`
);

content = content.replace(
    /          default:\n            return \(b\.new \? 1 : 0\) - \(a\.new \? 1 : 0\);\n        \}\n      \}\);/,
    `          default:
            return (b.new ? 1 : 0) - (a.new ? 1 : 0);
        }
      });
      
      if (isTourActive) {
          const camachoIndex = sorted.findIndex(p => p.id === 'Camacho 7');
          if (camachoIndex !== -1) {
              const camacho = sorted.splice(camachoIndex, 1)[0];
              sorted.unshift(camacho);
          } else {
              const camacho = products.find(p => p.id === 'Camacho 7');
              if (camacho) {
                  sorted.unshift(camacho);
              }
          }
      }
      
      return sorted;`
);

// 3. Add isTourActive to dependency array
content = content.replace(
    /      brandsFilter,\n      promoFilter,\n      sortOption,\n    \]\);/,
    `      brandsFilter,
      promoFilter,
      sortOption,
      isTourActive,
    ]);`
);

fs.writeFileSync(file, content);
console.log('Modified shop page to inject Camacho 7 for tour');
