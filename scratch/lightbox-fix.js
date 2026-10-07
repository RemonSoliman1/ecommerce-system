const fs = require('fs');
let lines = fs.readFileSync('app/[locale]/product/[id]/ProductClient.js', 'utf8').split('\n');

const lightboxHtml = `
            {/* Lightbox Modal */}
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
}
`;

let fileContent = lines.join('\n');
fileContent = fileContent.replace(/<\/div >\s*\);\s*\}\s*$/, lightboxHtml);

fs.writeFileSync('app/[locale]/product/[id]/ProductClient.js', fileContent);
console.log('Added lightbox');
