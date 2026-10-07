const fs = require('fs');

let content = fs.readFileSync('app/[locale]/admin/page.js', 'utf8');
const lines = content.split('\n');

const imports = [
    "import AdminOrdersTab from './components/AdminOrdersTab';",
    "import AdminUsersTab from './components/AdminUsersTab';",
    "import AdminAttributesTab from './components/AdminAttributesTab';"
];

if (!content.includes('import AdminOrdersTab')) {
    const importIdx = lines.findIndex(l => l.includes("import AdminProductsTab from './components/AdminProductsTab';"));
    if (importIdx !== -1) {
        lines.splice(importIdx + 1, 0, ...imports);
    }
}

const ordersIdx = lines.findIndex(l => l.includes("activeTab === 'orders' && (() => {"));
const attributesIdx = lines.findIndex(l => l.includes("activeTab === 'attributes' && ("));
const usersIdx = lines.findIndex(l => l.includes("activeTab === 'users' && ("));
const promosIdx = lines.findIndex(l => l.includes("activeTab === 'promotions' && ("));

if (ordersIdx > -1 && attributesIdx > -1 && usersIdx > -1 && promosIdx > -1) {
    const beforeOrders = lines.slice(0, ordersIdx - 1); // include the { before it if any, wait, it's safer to just look at lines
    // actually, let's just replace lines from ordersIdx - 1 to promosIdx - 2.
    // wait, line ordersIdx - 1 is `{`
    const afterPromos = lines.slice(promosIdx - 1); // line promosIdx - 1 is `{`
    
    const replacements = [
        "            {activeTab === 'orders' && (",
        "                <AdminOrdersTab",
        "                    adminOrders={adminOrders} setAdminOrders={setAdminOrders}",
        "                    orderSearch={orderSearch} setOrderSearch={setOrderSearch}",
        "                    orderStatusFilter={orderStatusFilter} setOrderStatusFilter={setOrderStatusFilter}",
        "                    orderDateFilter={orderDateFilter} setOrderDateFilter={setOrderDateFilter}",
        "                    expandedOrderId={expandedOrderId} setExpandedOrderId={setExpandedOrderId}",
        "                    handleConfirmOrder={handleConfirmOrder} handleCancelOrder={handleCancelOrder}",
        "                    confirmingOrder={confirmingOrder}",
        "                    user={user}",
        "                />",
        "            )}",
        "",
        "            {activeTab === 'attributes' && (",
        "                <AdminAttributesTab",
        "                    persistentAttributes={persistentAttributes} setPersistentAttributes={setPersistentAttributes}",
        "                    hiddenAttributes={hiddenAttributes} setHiddenAttributes={setHiddenAttributes}",
        "                    attributeMetadata={attributeMetadata} setAttributeMetadata={setAttributeMetadata}",
        "                    newAttributeForm={newAttributeForm} setNewAttributeForm={setNewAttributeForm}",
        "                    autoHideStock={globalAutoHide} setAutoHideStock={() => {}}",
        "                    products={products}",
        "                />",
        "            )}",
        "",
        "            {activeTab === 'users' && (",
        "                <AdminUsersTab",
        "                    adminUsers={adminUsers} setAdminUsers={setAdminUsers}",
        "                    expandedUserId={expandedUserId} setExpandedUserId={setExpandedUserId}",
        "                />",
        "            )}"
    ];
    
    const newLines = [...beforeOrders, ...replacements, ...afterPromos];
    fs.writeFileSync('app/[locale]/admin/page.js', newLines.join('\n'));
    console.log('Successfully replaced tabs!');
} else {
    console.log('Could not find one of the indexes:', { ordersIdx, attributesIdx, usersIdx, promosIdx });
}
