const fs = require('fs');
const file = 'app/[locale]/admin/components/AdminUsersTab.js';
let content = fs.readFileSync(file, 'utf8');

const targetFunc = `export default function AdminUsersTab({
    adminUsers, setAdminUsers,
    expandedUserId, setExpandedUserId
}) {
    const exportCustomerOrders = (user) => {
        if (!user.recent_orders || user.recent_orders.length === 0) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Order ID,Date,Status,Total Amount,Payment Method,Processed By,Item Name,Size/Vitola,Quantity,Price\\n";
        
        user.recent_orders.forEach(ro => {
            let itemsArr = [];
            try {
                itemsArr = Array.isArray(ro.items) ? ro.items : (typeof ro.items === 'string' ? JSON.parse(ro.items) : []);
            } catch(e) {}
            
            const dateStr = new Date(ro.created_at).toLocaleDateString();
            const orderIdStr = String(ro.id);
            const status = ro.status || '';
            const payment = ro.payment_method || '';
            const processed = ro.processed_by || '';
            
            if (itemsArr.length === 0) {
                csvContent += \`"\${orderIdStr}","\${dateStr}","\${status}",\${ro.total_amount},"\${payment}","\${processed}","","","",\\n\`;
            } else {
                itemsArr.forEach(item => {
                    const itemName = (item.name || item.product_name || '').replace(/"/g, '""');
                    const size = (item.selectedSize || item.size || '').replace(/"/g, '""');
                    const qty = item.quantity || 1;
                    const price = item.price || 0;
                    csvContent += \`"\${orderIdStr}","\${dateStr}","\${status}",\${ro.total_amount},"\${payment}","\${processed}","\${itemName}","\${size}",\${qty},\${price}\\n\`;
                });
            }
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", \`\${user.email || 'customer'}_purchase_history.csv\`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (`

content = content.replace(`export default function AdminUsersTab({
    adminUsers, setAdminUsers,
    expandedUserId, setExpandedUserId
}) {
    return (`, targetFunc);

const oldHeader = `<h4 style={{ color: 'var(--color-accent)', marginBottom: '10px' }}>Recent Orders</h4>`;
const newHeader = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                                        <h4 style={{ color: 'var(--color-accent)' }}>Purchase History</h4>
                                                                        {u.recent_orders && u.recent_orders.length > 0 && (
                                                                            <button 
                                                                                onClick={() => exportCustomerOrders(u)}
                                                                                style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                                                title="Export Purchase Analytics"
                                                                            >
                                                                                Export CSV
                                                                            </button>
                                                                        )}
                                                                    </div>`;

content = content.replace(oldHeader, newHeader);

fs.writeFileSync(file, content);
console.log("Success");
