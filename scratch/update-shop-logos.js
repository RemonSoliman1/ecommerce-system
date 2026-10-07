const fs = require('fs');
const path = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(path, 'utf8');

const regex = /<div className=\{styles\.brandLogo\}>[\s\S]*?<\/div>/;

const newLogoBlock = `                    <div 
                      className={styles.brandLogo}
                      style={{ background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(245,240,232,1) 100%)" }}
                    >
                      {brandDomains[brand.name] ? (
                        <>
                          <img
                            src={\`https://logo.clearbit.com/\${brandDomains[brand.name]}\`}
                            alt={brand.name}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.target.style.display = "none";
                              if (e.target.nextElementSibling) {
                                e.target.nextElementSibling.style.display = "flex";
                              }
                            }}
                          />
                          <span style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: '#111', padding: '4px', wordBreak: 'break-word', lineHeight: '1.2' }}>
                            {brand.name}
                          </span>
                        </>
                      ) : (
                        <span style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: '#111', padding: '4px', wordBreak: 'break-word', lineHeight: '1.2' }}>
                          {brand.name}
                        </span>
                      )}
                    </div>`;

if (regex.test(content)) {
    content = content.replace(regex, newLogoBlock);
    fs.writeFileSync(path, content);
    console.log('Success');
} else {
    console.log('Failed to match regex');
}
