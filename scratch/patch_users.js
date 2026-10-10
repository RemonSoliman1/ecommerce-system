const fs = require('fs');
const file = 'app/[locale]/admin/components/AdminUsersTab.js';
let content = fs.readFileSync(file, 'utf8');

const target = `<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                            {u.recent_orders.map(ro => (
                                                                                <div key={ro.id} style={{ fontSize: '0.85rem', padding: '8px', background: '#222', borderRadius: '4px' }}>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                                        <span>#{String(ro.id).substring(0, 8)}...</span>
                                                                                        <span style={{ color: ro.status?.toLowerCase() === 'cancelled' ? '#ff4d4d' : ro.status?.toLowerCase() === 'pending' ? '#d4af37' : '#4CAF50' }}>{ro.status}</span>
                                                                                    </div>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                                                                                        <span>EGP {Number(ro.total_amount || 0).toLocaleString()}</span>
                                                                                        <span>{new Date(ro.created_at).toLocaleDateString()}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>`;

const newCode = `<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                                                                            {u.recent_orders.map(ro => {
                                                                                let itemsArr = [];
                                                                                try {
                                                                                    itemsArr = Array.isArray(ro.items) ? ro.items : (typeof ro.items === 'string' ? JSON.parse(ro.items) : []);
                                                                                } catch(e) {}
                                                                                return (
                                                                                <details key={ro.id} style={{ fontSize: '0.85rem', padding: '8px', background: '#222', borderRadius: '4px' }}>
                                                                                    <summary style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', cursor: 'pointer', outline: 'none' }}>
                                                                                        <span>#{String(ro.id).substring(0, 8)}...</span>
                                                                                        <span>EGP {Number(ro.total_amount || 0).toLocaleString()}</span>
                                                                                        <span style={{ color: ro.status?.toLowerCase() === 'cancelled' ? '#ff4d4d' : ro.status?.toLowerCase() === 'pending' ? '#d4af37' : '#4CAF50' }}>{ro.status}</span>
                                                                                    </summary>
                                                                                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #444', color: '#ccc' }}>
                                                                                        <div style={{ marginBottom: '4px' }}><strong>Date:</strong> {new Date(ro.created_at).toLocaleDateString()}</div>
                                                                                        {ro.payment_method && <div style={{ marginBottom: '4px' }}><strong>Payment:</strong> {ro.payment_method}</div>}
                                                                                        {ro.processed_by && <div style={{ marginBottom: '4px' }}><strong>Processed By:</strong> {ro.processed_by}</div>}
                                                                                        <div style={{ marginTop: '8px', fontWeight: 'bold' }}>Items:</div>
                                                                                        {itemsArr.length > 0 ? itemsArr.map((item, idx) => (
                                                                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dotted #333' }}>
                                                                                                <span style={{flex: 1, paddingRight: '8px'}}>{item.quantity || 1}x {item.name || item.product_name} {item.selectedSize || item.size ? \`(\${item.selectedSize || item.size})\` : ''}</span>
                                                                                                <span>EGP {Number(item.price || 0) * Number(item.quantity || 1)}</span>
                                                                                            </div>
                                                                                        )) : <div style={{color:'#888'}}>No items details</div>}
                                                                                    </div>
                                                                                </details>
                                                                            )})}
                                                                        </div>`;

if (content.indexOf(target.trim()) !== -1) {
    console.log("Found");
} else {
    // Regex replace using a more flexible approach
    const lines = content.split('\n');
    const startIdx = lines.findIndex(l => l.includes("gap: '8px'"));
    const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes("</div>") && lines[i-1].includes("))}"));
    
    if(startIdx !== -1 && endIdx !== -1) {
        lines.splice(startIdx, endIdx - startIdx + 1, newCode);
        fs.writeFileSync(file, lines.join('\n'));
        console.log("Patched array map code");
    } else {
        console.log("Could not find start/end bounds.");
    }
}
