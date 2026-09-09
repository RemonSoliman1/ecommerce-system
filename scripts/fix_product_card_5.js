const fs = require('fs');
let content = fs.readFileSync('components/ui/ProductCard.js', 'utf8').replace(/\r\n/g, '\n');

content = content.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport QuickAddModal from './QuickAddModal';");

content = content.replace("const [imgError, setImgError] = useState(false);", "const [imgError, setImgError] = useState(false);\n    const [showQuickAdd, setShowQuickAdd] = useState(false);");

let returnRegex = /return \(\s*<Link/g;
content = content.replace(returnRegex, `return (\n        <div style={{ position: 'relative' }}>\n            <Link`);

let exactBottomMatch = `                        {hasDiscount ? (
                            <>
                                <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '0.8rem' }}>EGP {originalPrice.toLocaleString()}</span>
                                <span className={styles.price} style={{ color: '#ff4d4d', marginTop: '2px' }}>{t('from')} EGP {startPrice.toLocaleString()} <span style={{ fontSize: '0.75rem', background: '#ff4d4d', color: '#fff', padding: '2px 4px', borderRadius: '4px', marginLeft: '5px' }}>-{discountPercent}%</span></span>
                            </>
                        ) : (
                            <span className={styles.price}>{t('from')} EGP {startPrice.toLocaleString()}</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );`;

let replacementBottom = `                        {hasDiscount ? (
                            <>
                                <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '0.8rem' }}>EGP {originalPrice.toLocaleString()}</span>
                                <span className={styles.price} style={{ color: '#ff4d4d', marginTop: '2px' }}>{t('from')} EGP {startPrice.toLocaleString()} <span style={{ fontSize: '0.75rem', background: '#ff4d4d', color: '#fff', padding: '2px 4px', borderRadius: '4px', marginLeft: '5px' }}>-{discountPercent}%</span></span>
                            </>
                        ) : (
                            <span className={styles.price}>{t('from')} EGP {startPrice.toLocaleString()}</span>
                        )}
                    </div>
                    {!isOut && (
                        <button
                            style={{ background: 'var(--color-accent)', color: '#120c0a', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowQuickAdd(true);
                            }}
                        >
                            {t('add_to_cart') || 'Add +'}
                        </button>
                    )}
                </div>
            </div>
        </Link>
        {showQuickAdd && <QuickAddModal product={product} onClose={() => setShowQuickAdd(false)} />}
        </div>
    );`;

content = content.replace(exactBottomMatch, replacementBottom);
content = content.replace("<div className={styles.cardFooter} style={{ alignItems: 'flex-start' }}>", "<div className={styles.cardFooter} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '10px' }}>");

fs.writeFileSync('components/ui/ProductCard.js', content);
console.log("Fixed ProductCard.js successfully!");
