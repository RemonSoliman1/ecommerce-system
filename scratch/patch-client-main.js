const fs = require('fs');
let content = fs.readFileSync('app/[locale]/product/[id]/ProductClient.js', 'utf8');

const mainImgRegex = /<img src=\{activeImage \|\| product\.image \|\| '\/images\/placeholder\.png'\} alt=\{product\.name\}[\s\S]*?style=\{\{ background: 'transparent' \}\} \/>/;

const mainImageReplacement = `{activeIsVideo ? (
                            <video src={activeImage} controls playsInline style={{ width: '100%', height: '100%', maxHeight: '500px', objectFit: 'contain' }} />
                        ) : (
                            <>
                                <img 
                                    src={activeImage || product.image || '/images/placeholder.png'} 
                                    alt={product.name}
                                    onError={(e) => { e.target.src = '/images/placeholder.png'; }} 
                                    style={{ background: 'transparent', cursor: 'zoom-in', width: '100%', height: '100%', objectFit: 'contain' }} 
                                    onClick={() => setLightboxOpen(true)}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                />
                                {magnifier.show && (
                                    <div style={{
                                        position: 'absolute',
                                        pointerEvents: 'none',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundImage: \`url(\${activeImage || product.image})\`,
                                        backgroundPosition: \`\${magnifier.x}% \${magnifier.y}%\`,
                                        backgroundSize: '250%',
                                        backgroundRepeat: 'no-repeat',
                                        zIndex: 5,
                                        borderRadius: '8px'
                                    }} />
                                )}
                            </>
                        )}`;

content = content.replace(mainImgRegex, mainImageReplacement);
fs.writeFileSync('app/[locale]/product/[id]/ProductClient.js', content);
