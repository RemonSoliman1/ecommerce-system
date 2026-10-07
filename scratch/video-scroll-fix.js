const fs = require('fs');
let content = fs.readFileSync('app/[locale]/product/[id]/ProductClient.js', 'utf8');

// 1. Add useRef to imports
content = content.replace(
    "import { useState, use, useEffect, useMemo } from 'react';", 
    "import { useState, use, useEffect, useMemo, useRef } from 'react';"
);

// 2. Add imageContainerRef and wheel effect
const magnifierState = "    const [magnifier, setMagnifier] = useState({ show: false, x: 0, y: 0, zoom: 250 });";
const wheelEffect = `    const imageContainerRef = useRef(null);

    useEffect(() => {
        const el = imageContainerRef.current;
        if (!el) return;
        const handleNativeWheel = (e) => {
            if (magnifier.show) {
                e.preventDefault(); // Stop page scrolling
                setMagnifier(prev => {
                    const newZoom = Math.min(Math.max(prev.zoom + (e.deltaY > 0 ? -30 : 30), 100), 500);
                    return { ...prev, zoom: newZoom };
                });
            }
        };
        el.addEventListener('wheel', handleNativeWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleNativeWheel);
    }, [magnifier.show]);`;

content = content.replace(magnifierState, magnifierState + '\n' + wheelEffect);

// 3. Remove the old handleWheel
content = content.replace(/    const handleWheel = \(e\) => \{[\s\S]*?    \};\n\n/, '');

// 4. Update the handleMouseMove to remove "if (activeIsVideo) return;" so it works on videos too
content = content.replace('        if (activeIsVideo) return;\n', '');


// 5. Replace the rendering of the main media
// Target the block starting from `{activeIsVideo ? (` to `</>`
const renderTargetRegex = /\{activeIsVideo \? \([\s\S]*?<\/>\n                        \)}/;

const newRender = `{activeIsVideo ? (
                            <>
                                <video 
                                    src={activeImage} 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline 
                                    style={{ width: '100%', height: '100%', maxHeight: '500px', objectFit: 'contain', cursor: 'zoom-in' }} 
                                    onClick={() => setLightboxOpen(true)}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                />
                                {magnifier.show && (
                                    <div style={{
                                        position: 'absolute',
                                        pointerEvents: 'none',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        zIndex: 5,
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        background: 'transparent'
                                    }}>
                                        <video 
                                            src={activeImage} 
                                            autoPlay 
                                            loop 
                                            muted 
                                            playsInline 
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                transformOrigin: \`\${magnifier.x}% \${magnifier.y}%\`,
                                                transform: \`scale(\${magnifier.zoom / 100})\`
                                            }}
                                        />
                                    </div>
                                )}
                            </>
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
                                        backgroundSize: \`\${magnifier.zoom}%\`,
                                        backgroundRepeat: 'no-repeat',
                                        zIndex: 5,
                                        borderRadius: '8px'
                                    }} />
                                )}
                            </>
                        )}`;

content = content.replace(renderTargetRegex, newRender);

// 6. Attach imageContainerRef to the .mainImage div
content = content.replace('<div className={styles.mainImage} style={{ position: \'relative\' }}>', '<div ref={imageContainerRef} className={styles.mainImage} style={{ position: \'relative\' }}>');

fs.writeFileSync('app/[locale]/product/[id]/ProductClient.js', content);
console.log('Fixed Video and Wheel');
