const fs = require('fs');
const file = 'app/[locale]/product/[id]/ProductClient.js';
let content = fs.readFileSync(file, 'utf8');

const trackingCode = `
    // TRACKING: Product View
    useEffect(() => {
        if (product && product.id) {
            fetch('/api/tracking/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user?.id || null,
                    event_type: 'view_product',
                    target_id: String(product.id),
                    metadata: { product_name: product.name }
                })
            }).catch(() => {});
        }
    }, [product?.id, user?.id]);

    const allImages`;

content = content.replace('const allImages', trackingCode);
fs.writeFileSync(file, content);
console.log('Success');
