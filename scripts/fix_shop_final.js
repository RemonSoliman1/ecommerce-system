const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// The literal `\n` is now in the file. Let's fix that.
content = content.replace("</div>\\n        </div>\\n        </div>\\n        </>\\n    );\\n}\\n\\nfunction ShopProductCard({ product, t, activePromos = [] }) {", 
`</div>
        </div>
        </div>
        </>
    );
}

function ShopProductCard({ product, t, activePromos = [] }) {`);

fs.writeFileSync(file, content);
console.log('Fixed shop page literal \\n');
