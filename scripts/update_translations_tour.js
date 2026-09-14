const fs = require('fs');

function addKeys(file, keys) {
    let content = fs.readFileSync(file, 'utf8');
    let json = JSON.parse(content);
    
    Object.assign(json.Tour, keys);
    
    fs.writeFileSync(file, JSON.stringify(json, null, 4));
    console.log(`Updated ${file}`);
}

addKeys('messages/en.json', {
    "view_details_title": "Product Actions",
    "view_details_desc": "Hovering or tapping on a product reveals quick actions. Click here to see the full product details page!"
});

addKeys('messages/ar.json', {
    "view_details_title": "OOOOOOO OU,UU+OO",
    "view_details_desc": "OU,OUOUSO OU^ OU,U+U,O OU,US OU,UU+OO USOUO OOOOOOO O3OUSOO. OOOO U+U+O U,OOUSO OU,OU,USO OU,UU+OO OU,UOUU,O!"
});
