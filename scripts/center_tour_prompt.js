const fs = require('fs');
let file = 'context/TourContext.js';
let content = fs.readFileSync(file, 'utf8');

// Replace the small bottom-left prompt with a centered modal overlay
const regex = /<div style=\{\{\s*position: 'fixed',\s*bottom: '20px',\s*left: '20px',\s*background: 'rgba\(25,\s*25,\s*25,\s*0\.95\)',\s*border: '1px solid var\(--color-accent\)',\s*padding: '1\.5rem',\s*borderRadius: '8px',\s*zIndex: 9999,\s*boxShadow: '0 10px 30px rgba\(0,0,0,0\.5\)',\s*maxWidth: '350px',\s*color: '#fff',\s*backdropFilter: 'blur\(10px\)'\s*\}\}>/g;

const replacement = `<div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 99999
                }}>
                    <div style={{
                        background: 'rgba(25, 25, 25, 0.95)',
                        border: '1px solid var(--color-accent)',
                        padding: '2.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        maxWidth: '400px',
                        width: '90%',
                        color: '#fff',
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center'
                    }}>`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    // Add the closing div for the overlay
    content = content.replace(/<\/div>\s*<\/TourContext\.Provider>/g, '</div>\n                    </div>\n        </TourContext.Provider>');
    
    // Also center the buttons
    content = content.replace(
        /<div style=\{\{\s*display: 'flex',\s*gap: '10px',\s*marginTop: '15px'\s*\}\}>/g,
        '<div style={{ display: \'flex\', gap: \'15px\', marginTop: \'25px\', justifyContent: \'center\' }}>'
    );
    
    fs.writeFileSync(file, content);
    console.log('Centered tour prompt');
} else {
    console.log('Could not find tour prompt div');
}
