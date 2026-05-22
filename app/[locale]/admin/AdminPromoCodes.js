'use client';
import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function AdminPromoCodes() {
    const [promotions, setPromotions] = useState([]);
    
    // New Promo State
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [maxDiscountValue, setMaxDiscountValue] = useState('');
    const [usageLimit, setUsageLimit] = useState('');
    const [ruleFirstOrder, setRuleFirstOrder] = useState(false);
    const [ruleOneTimeUse, setRuleOneTimeUse] = useState(false);
    
    // New rules
    const [enableUsageLimit, setEnableUsageLimit] = useState(false);
    const [enableMinOrder, setEnableMinOrder] = useState(false);
    const [minOrderAmount, setMinOrderAmount] = useState('');
    const [enableMinQuantity, setEnableMinQuantity] = useState(false);
    const [minQuantity, setMinQuantity] = useState('');
    const [enablePaymentRestriction, setEnablePaymentRestriction] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [expandedPromoId, setExpandedPromoId] = useState(null);
    
    const [targetType, setTargetType] = useState('all');
    const [targetIds, setTargetIds] = useState([]); // Support multiple targets
    const [customerTargetType, setCustomerTargetType] = useState('all'); // all, specific, vip
    const [customerEmails, setCustomerEmails] = useState([]);
    const [targetSearch, setTargetSearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    
    // Data for dropdowns
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [customers, setCustomers] = useState([]);

    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchPromos();
        fetchData();
    }, []);

    const fetchPromos = async () => {
        try {
            const res = await fetch('/api/admin/promos', { headers: { 'Authorization': 'Bearer admin@129' } });
            const data = await res.json();
            if (data.success) setPromotions(data.promotions);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchData = () => {
        fetch('/api/products').then(res => res.json()).then(data => {
            if(Array.isArray(data)) setProducts(data);
            else if(data.products) setProducts(data.products);
        });
        fetch('/api/brands').then(res => res.json()).then(data => {
            if(Array.isArray(data)) setBrands(data);
            else if(data.brands) setBrands(data.brands);
        });
        fetch('/api/admin/users', { headers: { 'Authorization': 'Bearer admin@129' } }).then(res => res.json()).then(data => {
            if(data.users) setCustomers(data.users);
            else if(Array.isArray(data)) setCustomers(data);
        });
    };

    const generateCode = (e) => {
        e.preventDefault();
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        setCode(`PROMO-${randomString}`);
    };

    const handleCreatePromo = async (e) => {
        e.preventDefault();
        setStatus('Saving...');

        try {
            const res = await fetch('/api/admin/promos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin@129' },
                body: JSON.stringify({
                    code: code.toUpperCase(),
                    discount_type: discountType,
                    discount_value: parseFloat(discountValue),
                    max_discount_value: maxDiscountValue ? parseFloat(maxDiscountValue) : null,
                    target_type: targetType,
                    target_id: targetIds.length > 0 ? targetIds.join(',') : null,
                    customer_email: customerTargetType === 'specific' && customerEmails.length > 0 ? customerEmails.join(',') : null,
                    usage_limit: enableUsageLimit && usageLimit ? parseInt(usageLimit) : null,
                    rule_first_order: ruleFirstOrder,
                    rule_one_time_use: ruleOneTimeUse,
                    rule_min_order_amount: enableMinOrder && minOrderAmount ? parseFloat(minOrderAmount) : null,
                    rule_min_quantity: enableMinQuantity && minQuantity ? parseInt(minQuantity) : null,
                    rule_payment_methods: enablePaymentRestriction && paymentMethods.length > 0 ? paymentMethods.join(',') : null,
                    active: true
                })
            });

            const data = await res.json();
            if (data.success) {
                setStatus('Success! Promo code created.');
                fetchPromos();
                setCode('');
                setDiscountValue('');
                setMaxDiscountValue('');
                setUsageLimit('');
                setRuleFirstOrder(false);
                setRuleOneTimeUse(false);
                setEnableUsageLimit(false);
                setEnableMinOrder(false);
                setMinOrderAmount('');
                setEnableMinQuantity(false);
                setMinQuantity('');
                setEnablePaymentRestriction(false);
                setPaymentMethods([]);
            } else {
                setStatus(`Error: ${data.error}`);
            }
        } catch (err) {
            setStatus('An unexpected error occurred.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this promo code?')) return;
        try {
            await fetch(`/api/admin/promos?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer admin@129' }
            });
            fetchPromos();
        } catch (e) {
            console.error(e);
        }
    };

    const toggleTarget = (id) => {
        setTargetIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    const handleExport = (code) => {
        window.location.href = `/api/admin/promos/export?code=${encodeURIComponent(code)}`;
    };

    const toggleCustomer = (email) => {
        setCustomerEmails(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
    };

    const inputStyle = { width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', marginBottom: '1rem' };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', color: '#fff' }}>
            <h1 style={{ color: '#D4AF37', marginBottom: '1rem' }}>Promo Codes</h1>
            <p style={{ color: '#ccc', marginBottom: '2rem' }}>Generate and manage promotional discount codes.</p>
            <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '1.5rem' }}>
                <strong>Note:</strong> You must run the `promotions_setup.md` SQL script in Supabase first before creating promos!
            </p>

            <form onSubmit={handleCreatePromo} style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', border: '1px solid #333', marginBottom: '3rem' }}>
                <h3 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Create New Promo Code</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Code Name</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required style={{ ...inputStyle, marginBottom: 0, textTransform: 'uppercase' }} placeholder="e.g. VIP2026" />
                            <button onClick={generateCode} style={{ padding: '0 1rem', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer' }}>Generate</button>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Discount Type</label>
                        <select value={discountType} onChange={e => setDiscountType(e.target.value)} style={inputStyle}>
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (EGP)</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Discount Value</label>
                        <input type="number" step="0.01" value={discountValue} onChange={e => setDiscountValue(e.target.value)} required style={inputStyle} placeholder={discountType === 'percentage' ? "20" : "150"} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: discountType === 'percentage' ? '#fff' : '#555' }}>Maximum Discount (EGP) {discountType !== 'percentage' && '(N/A for Fixed)'}</label>
                        <input type="number" step="0.01" value={maxDiscountValue} onChange={e => setMaxDiscountValue(e.target.value)} disabled={discountType !== 'percentage'} style={{...inputStyle, opacity: discountType === 'percentage' ? 1 : 0.5}} placeholder="e.g. 500 (Optional)" />
                    </div>
                </div>

                {/* RULES & RESTRICTIONS BOX */}
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#222', borderRadius: '8px', border: '1px solid #444' }}>
                    <h4 style={{ color: '#D4AF37', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Rules & Restrictions</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Overall Usage Limit */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                                <input type="checkbox" checked={enableUsageLimit} onChange={e => setEnableUsageLimit(e.target.checked)} />
                                Limit Total Usages Overall (e.g. First 200)
                            </label>
                            {enableUsageLimit && (
                                <input type="number" step="1" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} style={inputStyle} placeholder="e.g. 200" />
                            )}
                        </div>

                        {/* Minimum Order Amount */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                                <input type="checkbox" checked={enableMinOrder} onChange={e => setEnableMinOrder(e.target.checked)} />
                                Minimum Order Amount (EGP)
                            </label>
                            {enableMinOrder && (
                                <input type="number" step="0.01" value={minOrderAmount} onChange={e => setMinOrderAmount(e.target.value)} style={inputStyle} placeholder="e.g. 1500" />
                            )}
                        </div>

                        {/* Minimum Item Quantity */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                                <input type="checkbox" checked={enableMinQuantity} onChange={e => setEnableMinQuantity(e.target.checked)} />
                                Min. Item Quantity (Sticks/Boxes)
                            </label>
                            {enableMinQuantity && (
                                <input type="number" step="1" value={minQuantity} onChange={e => setMinQuantity(e.target.value)} style={inputStyle} placeholder="e.g. 3" />
                            )}
                        </div>

                        {/* Single Use / First Order */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', justifyContent: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={ruleFirstOrder} onChange={e => setRuleFirstOrder(e.target.checked)} />
                                Only valid for the customer's First Order
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={ruleOneTimeUse} onChange={e => setRuleOneTimeUse(e.target.checked)} />
                                Limit to 1 use per customer
                            </label>
                        </div>

                        {/* Payment Method Restrictions */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                                <input type="checkbox" checked={enablePaymentRestriction} onChange={e => setEnablePaymentRestriction(e.target.checked)} />
                                Restrict by Payment Method
                            </label>
                            {enablePaymentRestriction && (
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.5rem', background: '#1a1a1a', borderRadius: '4px' }}>
                                    {['card', 'instapay', 'vodafone', 'cash'].map(method => (
                                        <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={paymentMethods.includes(method)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setPaymentMethods([...paymentMethods, method]);
                                                    else setPaymentMethods(paymentMethods.filter(m => m !== method));
                                                }}
                                            />
                                            {method === 'card' ? 'Credit Card' : method === 'instapay' ? 'Instapay' : method === 'vodafone' ? 'Vodafone Cash' : 'Cash on Delivery'}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Target Filter (Products/Brands)</label>
                        <select value={targetType} onChange={e => { setTargetType(e.target.value); setTargetIds([]); }} style={inputStyle}>
                            <option value="all">Entire Order</option>
                            <option value="product">Specific Product(s) Only</option>
                            <option value="brand">Specific Brand(s) Only</option>
                        </select>
                    </div>
                </div>

                {targetType === 'product' && (
                    <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Products</label>
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={targetSearch} 
                            onChange={e => setTargetSearch(e.target.value)}
                            style={{ ...inputStyle, marginBottom: '0.5rem' }}
                        />
                        <div style={{ maxHeight: '250px', overflowX: 'hidden', overflowY: 'auto', background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {products.filter(p => p.name.toLowerCase().includes(targetSearch.toLowerCase())).map(p => (
                                <label key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', width: '100%', padding: '12px 16px', cursor: 'pointer', background: targetIds.includes(String(p.id)) ? 'rgba(197, 163, 92, 0.2)' : 'transparent', borderBottom: '1px solid #444', fontSize: '0.9rem' }}>
                                    <span style={{ textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{p.name}</span>
                                    <input 
                                        type="checkbox" 
                                        checked={targetIds.includes(String(p.id))} 
                                        onChange={() => toggleTarget(String(p.id))}
                                        style={{ justifySelf: 'end', cursor: 'pointer', transform: 'scale(1.2)' }}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                
                {targetType === 'brand' && (
                    <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Brands</label>
                        <input 
                            type="text" 
                            placeholder="Search brands..." 
                            value={targetSearch} 
                            onChange={e => setTargetSearch(e.target.value)}
                            style={{ ...inputStyle, marginBottom: '0.5rem' }}
                        />
                        <div style={{ maxHeight: '250px', overflowX: 'hidden', overflowY: 'auto', background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {brands.filter(b => b.name?.toLowerCase().includes(targetSearch.toLowerCase())).map(b => (
                                <label key={b.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', width: '100%', padding: '12px 16px', cursor: 'pointer', background: targetIds.includes(b.id) ? 'rgba(197, 163, 92, 0.2)' : 'transparent', borderBottom: '1px solid #444', fontSize: '0.9rem' }}>
                                    <span style={{ textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{b.name}</span>
                                    <input 
                                        type="checkbox" 
                                        checked={targetIds.includes(b.id)} 
                                        onChange={() => toggleTarget(b.id)}
                                        style={{ justifySelf: 'end', cursor: 'pointer', transform: 'scale(1.2)' }}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '2rem' }}>
                    <h4 style={{ color: '#D4AF37', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Customer Targeting</h4>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <label><input type="radio" checked={customerTargetType === 'all'} onChange={() => setCustomerTargetType('all')} /> Anyone can use this code</label>
                        <label><input type="radio" checked={customerTargetType === 'specific'} onChange={() => setCustomerTargetType('specific')} /> Specific Customer(s)</label>
                    </div>

                    {customerTargetType === 'specific' && (
                        <div>
                            <input 
                                type="text" 
                                placeholder="Search customers..." 
                                value={customerSearch} 
                                onChange={e => setCustomerSearch(e.target.value)}
                                style={{ ...inputStyle, marginBottom: '0.5rem' }}
                            />
                            <div style={{ maxHeight: '200px', overflowX: 'hidden', overflowY: 'auto', background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {customers.filter(c => c.name?.toLowerCase().includes(customerSearch.toLowerCase()) || c.email?.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                                    <label key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', width: '100%', padding: '12px 16px', cursor: 'pointer', background: customerEmails.includes(c.email) ? 'rgba(197, 163, 92, 0.2)' : 'transparent', borderBottom: '1px solid #444', fontSize: '0.9rem' }}>
                                        <span style={{ textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{c.name} ({c.email})</span>
                                        <input 
                                            type="checkbox" 
                                            checked={customerEmails.includes(c.email)} 
                                            onChange={() => toggleCustomer(c.email)}
                                            style={{ justifySelf: 'end', cursor: 'pointer', transform: 'scale(1.2)' }}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button type="submit" style={{ marginTop: '1rem', padding: '1rem 2rem', background: 'var(--color-accent)', color: '#120C0A', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Create Promo Code
                </button>

                {status && <div style={{ marginTop: '1rem', color: status.includes('Error') ? 'red' : '#00ff00' }}>{status}</div>}
            </form>

            <h3 style={{ color: '#D4AF37', marginBottom: '1rem' }}>Active Promo Codes</h3>
            <div style={{ background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#222', borderBottom: '1px solid #333' }}>
                            <th style={{ padding: '1rem' }}>Code</th>
                            <th style={{ padding: '1rem' }}>Discount</th>
                            <th style={{ padding: '1rem' }}>Rules</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No promotions active.</td>
                            </tr>
                        ) : promotions.map(promo => (
                            <React.Fragment key={promo.id}>
                                <tr style={{ borderBottom: expandedPromoId === promo.id ? 'none' : '1px solid #333', cursor: 'pointer', background: expandedPromoId === promo.id ? 'rgba(197, 163, 92, 0.05)' : 'transparent' }} onClick={() => setExpandedPromoId(expandedPromoId === promo.id ? null : promo.id)}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#D4AF37' }}>{promo.code}</td>
                                    <td style={{ padding: '1rem' }}>{promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `EGP ${promo.discount_value}`}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#aaa' }}>
                                        Applies to: <strong style={{color: '#fff'}}>{promo.target_type}</strong>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <button onClick={(e) => { e.stopPropagation(); handleExport(promo.code); }} style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }} title="Export Usage Data">
                                                Export
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(promo.id); }} style={{ background: 'transparent', color: 'red', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.3rem' }} title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedPromoId === promo.id && (
                                    <tr style={{ borderBottom: '1px solid #333', background: 'rgba(197, 163, 92, 0.05)' }}>
                                        <td colSpan="4" style={{ padding: '1rem 2rem 2rem 2rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
                                                <div>
                                                    <h5 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>Basic Details</h5>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                        <li><strong>Max Discount:</strong> {promo.max_discount_value ? `EGP ${promo.max_discount_value}` : 'Unlimited'}</li>
                                                        <li><strong>Target Type:</strong> {promo.target_type.toUpperCase()}</li>
                                                        <li><strong>Specific Targets:</strong> {promo.target_id ? promo.target_id : 'All Items'}</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h5 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>Usage Rules</h5>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                        <li><strong>Overall Limit:</strong> {promo.usage_limit ? `${promo.usage_count || 0} / ${promo.usage_limit} used` : 'Unlimited'}</li>
                                                        <li><strong>First Order Only:</strong> {promo.rule_first_order ? 'Yes' : 'No'}</li>
                                                        <li><strong>One-Time Use:</strong> {promo.rule_one_time_use ? 'Yes' : 'No'}</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h5 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>Order Restrictions</h5>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                        <li><strong>Min Order Amount:</strong> {promo.rule_min_order_amount ? `EGP ${promo.rule_min_order_amount}` : 'None'}</li>
                                                        <li><strong>Min Item Quantity:</strong> {promo.rule_min_quantity ? `${promo.rule_min_quantity} items` : 'None'}</li>
                                                        <li><strong>Allowed Payments:</strong> {promo.rule_payment_methods ? promo.rule_payment_methods.toUpperCase() : 'All Methods'}</li>
                                                        <li><strong>Specific Customers:</strong> {promo.customer_email ? (promo.customer_email.split(',').length > 1 ? `${promo.customer_email.split(',').length} Users` : promo.customer_email) : 'Anyone'}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
