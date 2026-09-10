const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

const targetBtn = `<button
                className="tour-add-to-cart-btn quickAddBtn"`;

if (content.includes(targetBtn)) {
    content = content.replace(targetBtn, `<div className="quickAddBtnArea" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '80px', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>\n            <button\n                className="tour-add-to-cart-btn quickAddBtn" style={{ position: 'static', transform: 'none' }}`);
    
    // Replace the closing button tag with button + div
    content = content.replace(
        /ADD TO CART'}\r?\n\s*<\/button>/g,
        "ADD TO CART'}\n            </button>\n        </div>"
    );
    fs.writeFileSync(file, content);
    console.log('Added wrapper for Add To Cart');
}

const outOfStockBtn = `<button
                className="tour-add-to-cart-btn quickAddBtn outOfStock"`;

if (content.includes(outOfStockBtn)) {
    content = content.replace(outOfStockBtn, `<div className="quickAddBtnArea" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '80px', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>\n            <button\n                className="tour-add-to-cart-btn quickAddBtn outOfStock" style={{ position: 'static', transform: 'none' }}`);
    
    // Replace the closing button tag for OUT OF STOCK
    content = content.replace(
        /OUT OF STOCK'}\r?\n\s*<\/button>/g,
        "OUT OF STOCK'}\n            </button>\n        </div>"
    );
    fs.writeFileSync(file, content);
    console.log('Added wrapper for Out Of Stock');
}
