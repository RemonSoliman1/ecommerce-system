const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// Add state to ShopProductCard
content = content.replace(
    'const [showQuickAdd, setShowQuickAdd] = useState(false);',
    'const [showQuickAdd, setShowQuickAdd] = useState(false);\n    const [isHoverExpanded, setIsHoverExpanded] = useState(false);'
);

// Add mouse handlers to the wrapper
content = content.replace(
    '<div className={styles.cardWrapper}>',
    '<div className={styles.cardWrapper}\n            onMouseLeave={() => setIsHoverExpanded(false)}\n            onMouseMove={(e) => {\n                if (!isHoverExpanded && !e.target.closest(".quickAddBtnArea")) {\n                    setIsHoverExpanded(true);\n                }\n            }}\n        >'
);

// Add className to cardHoverInfo to trigger CSS
content = content.replace(
    '<div className={styles.cardHoverInfo}>',
    '<div className={`${styles.cardHoverInfo} ${isHoverExpanded ? styles.expandedInfo : ""}`}>'
);

// Same for ProductSimpleCard at the top of the file!
content = content.replace(
    'const totalStock = product.models ? product.models.reduce',
    'const [isHoverExpanded, setIsHoverExpanded] = useState(false);\n  const totalStock = product.models ? product.models.reduce'
);

content = content.replace(
    '<Link href={`/product/${product.id}`} className={styles.simpleCard} style={{ position: \'relative\' }}>',
    '<Link href={`/product/${product.id}`} className={`${styles.simpleCard} ${isHoverExpanded ? styles.expandedCard : ""}`} style={{ position: \'relative\' }}\n      onMouseLeave={() => setIsHoverExpanded(false)}\n      onMouseMove={(e) => {\n          if (!isHoverExpanded && !e.target.closest(".quickAddBtnArea")) {\n              setIsHoverExpanded(true);\n          }\n      }}>'
);


fs.writeFileSync(file, content);
console.log('Added React hover state');
