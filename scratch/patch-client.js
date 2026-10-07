const fs = require('fs');
let content = fs.readFileSync('app/[locale]/product/[id]/ProductClient.js', 'utf8');

// 1. Add states
const stateInjection = `    const [magnifier, setMagnifier] = useState({ show: false, x: 0, y: 0 });
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const isVideo = (url) => url?.match(/\\.(mp4|webm|mov)(\\?.*)?$/i);
    const activeIsVideo = isVideo(activeImage || product?.image);

    const handleMouseMove = (e) => {
        if (activeIsVideo) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMagnifier({ show: true, x, y });
    };
    const handleMouseLeave = () => setMagnifier({ show: false, x: 0, y: 0 });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setLightboxOpen(false);
        };
        if (lightboxOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen]);
`;
content = content.replace('    const [showBespokeDrawer, setShowBespokeDrawer] = useState(false);', '    const [showBespokeDrawer, setShowBespokeDrawer] = useState(false);\n' + stateInjection);

// 2. Replace Main Image
const mainImageTarget = `<img src={activeImage || product.image || '/images/placeholder.png'} alt={product.name}
                            onError={(e) => { e.target.src = '/images/placeholder.png'; }} style={{ background: 'transparent' }} />`;

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
content = content.replace(mainImageTarget, mainImageReplacement);

// 3. Replace Thumbnail Map
const thumbTargetRegex = /\{allImages\.map\(\(img, idx\) => \([\s\S]*?<\/[^\>]+>[\s\S]*?\)\)\}/;
const thumbReplacement = `{allImages.map((img, idx) => {
                                const isVid = isVideo(img);
                                return (
                                <div key={idx} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActiveImage(img)}>
                                    {isVid ? (
                                        <video src={img} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: activeImage === img ? '2px solid var(--color-accent)' : '2px solid transparent', opacity: activeImage === img ? 1 : 0.8 }} />
                                    ) : (
                                        <img src={img} alt={\`\${product.name} \${idx}\`} onError={(e) => { e.target.style.display = 'none'; }} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: activeImage === img ? '2px solid var(--color-accent)' : '2px solid transparent', opacity: activeImage === img ? 1 : 0.8, transition: 'all 0.2s' }} />
                                    )}
                                    {isVid && (
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                                        </div>
                                    )}
                                </div>
                                );
                            })}`;
content = content.replace(thumbTargetRegex, thumbReplacement);


// 4. Add Lightbox
const lightboxTarget = /<\/div>\s*<\/div>\s*$/;
const lightboxHtml = `
            {lightboxOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onClick={() => setLightboxOpen(false)}>
                    <button style={{ position: 'absolute', top: '20px', right: '30px', background: 'none', border: 'none', color: 'white', fontSize: '2.5rem', cursor: 'pointer', zIndex: 10001 }}>&times;</button>
                    {allImages.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); handlePrevImage(); }} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'white', border: 'none', fontSize: '3rem', cursor: 'pointer', zIndex: 10001 }}>&#8249;</button>
                    )}
                    
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '80vh', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', background: 'white', borderRadius: '4px' }} onClick={e => e.stopPropagation()}>
                        {activeIsVideo ? (
                            <video src={activeImage} controls autoPlay style={{ maxWidth: '100%', maxHeight: 'calc(80vh - 20px)' }} />
                        ) : (
                            <img src={activeImage || product?.image} style={{ maxWidth: '100%', maxHeight: 'calc(80vh - 20px)', objectFit: 'contain' }} />
                        )}
                    </div>
                    <div style={{ color: 'white', marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>{product?.name}</div>

                    {allImages.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); handleNextImage(); }} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'white', border: 'none', fontSize: '3rem', cursor: 'pointer', zIndex: 10001 }}>&#8250;</button>
                    )}
                </div>
            )}
        </div>
    );
`;
// content = content.replace(lightboxTarget, lightboxHtml);
// Wait, the end of the file is just `</div>\n    );\n}`. I'll replace the last `</div>\n    );\n}`.
const endRegex = /<\/div>\s*\);\s*\}\s*$/;
content = content.replace(endRegex, lightboxHtml + '}');


fs.writeFileSync('app/[locale]/product/[id]/ProductClient.js', content);
