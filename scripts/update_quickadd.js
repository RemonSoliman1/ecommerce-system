const fs = require('fs');
let file = 'components/ui/QuickAddModal.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import Link from')) {
    content = content.replace("import styles from './QuickAddModal.module.css';", "import styles from './QuickAddModal.module.css';\nimport Link from 'next/link';");
}

content = content.replace(
    /<div className=\{styles\.header\}>\s*<img src=\{product\.image\}[^>]*\/>\s*<div>\s*<h3[^>]*>\{product\.name\}<\/h3>\s*<p[^>]*>.*?<\/p>\s*<\/div>\s*<\/div>/,
    `<div className={styles.header}>
                    <Link href={\`/product/\${product.id}\`} className="tour-quickadd-link" style={{ display: 'flex', gap: '15px', textDecoration: 'none', color: 'inherit', alignItems: 'center' }}>
                        <img src={product.image} alt={product.name} className={styles.productImg} />
                        <div>
                            <h3 className={styles.title}>{product.name}</h3>
                            <p className={styles.price}>EGP {priceToDisplay.toLocaleString()}</p>
                        </div>
                    </Link>
                </div>`
);

fs.writeFileSync(file, content);
console.log('Updated QuickAddModal');
