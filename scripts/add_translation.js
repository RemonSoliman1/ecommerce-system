const fs = require('fs');

function addKey(file) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!data.Account) data.Account = {};
    if (!data.Account.orders) data.Account.orders = {};
    if (!data.Account.orders.order_again) {
        data.Account.orders.order_again = file.includes('ar.json') ? "اطلب مرة أخرى" : "Order Again";
        fs.writeFileSync(file, JSON.stringify(data, null, 4));
        console.log(`Updated ${file}`);
    }
}
addKey('messages/en.json');
addKey('messages/ar.json');
