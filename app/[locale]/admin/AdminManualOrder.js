import React, { useState } from 'react';
import styles from './admin.module.css';
import { useProducts } from '@/context/ProductContext';
import { supabase } from '@/lib/supabaseClient';

export default function AdminManualOrder({ onOrderCreated }) {
    const { products } = useProducts();
    const [telegramId, setTelegramId] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedModelIndex, setSelectedModelIndex] = useState(0);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Smart Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    
    // Auto-search effect
    React.useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (data.customers) {
                    setSearchResults(data.customers);
                    setShowResults(true);
                }
            } catch (err) {
                console.error("Search error", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelectCustomer = (customer) => {
        setTelegramId(customer.id.toString());
        setSearchQuery(customer.displayName);
        setShowResults(false);
    };

    const productObj = products.find(p => p.id === selectedProduct);

    const handleAddItem = () => {
        if (!productObj || !productObj.models || !productObj.models[selectedModelIndex]) return;

        const model = productObj.models[selectedModelIndex];
        const newItem = {
            id: productObj.id,
            name: `${productObj.name} - ${model.name}`,
            variant: model.name,
            size: model.size,
            price: model.price,
            quantity: 1,
            image: model.image || productObj.image,
            availableStock: parseInt(model.stock || 0)
        };

        setOrderItems([...orderItems, newItem]);
    };

    const handleRemoveItem = (index) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const handleUpdateQuantity = (index, newQty) => {
        const updated = [...orderItems];
        const maxStock = updated[index].availableStock;
        updated[index].quantity = Math.max(1, Math.min(newQty, maxStock));
        setOrderItems(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (orderItems.length === 0) {
            setError("Add at least one item to the order.");
            return;
        }

        setLoading(true);
        try {
            const totalPrice = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            
            let finalEmail = 'pos.manual@cigarlounge.local';
            let custId = null;
            let tgId = null;
            let displayTitle = 'In-Person (No ID)';
            let displayAddress = 'In-Store POS';

            if (telegramId.trim()) {
                const numId = parseInt(telegramId.trim(), 10) || null;
                
                if (numId) {
                    // Try searching traditional ecommerce database customers first
                    const { data: webCust, error: webErr } = await supabase.from('customers').select('*').eq('id', numId).single();
                    
                    if (webCust && !webErr) {
                        custId = webCust.id;
                        finalEmail = webCust.email || finalEmail;
                        displayTitle = `Web: ${webCust.name || 'Unknown'} (ID: ${webCust.id})`;
                        
                        const addr = [];
                        if (webCust.address_street) addr.push(webCust.address_street);
                        if (webCust.address_city) addr.push(webCust.address_city);
                        if (addr.length > 0) displayAddress = addr.join(', ');
                    } else {
                        // Fallback to searching the telegram database
                        tgId = numId;
                        const { data: tp } = await supabase.from('telegram_users').select('first_name').eq('telegram_id', numId).single();
                        displayTitle = `TG: ${numId}` + (tp && tp.first_name ? ` (${tp.first_name})` : '');
                    }
                }
            }

            const payload = {
                orderId: `POS-${Date.now()}`,
                items: orderItems,
                total: totalPrice,
                customer: {
                    email: finalEmail,
                    name: displayTitle,
                    phone: 'N/A' // Native default for anonymous walk-ins
                },
                paymentMethod: 'Manual POS',
                telegramChatId: tgId || null,
                status: 'Completed'
            };

            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to submit POS Order via native Create endpoint.');
            }

            // Reset form gracefully
            setTelegramId('');
            setOrderItems([]);
            
            if (onOrderCreated) {
                const newMappedOrder = {
                    id: responseData.dbOrderId || payload.orderId,
                    userId: displayTitle,
                    userEmail: finalEmail,
                    date: new Date().toISOString(),
                    status: 'Completed',
                    total: totalPrice,
                    items: orderItems,
                    address: displayAddress,
                    paymentMethod: 'Manual POS'
                };
                onOrderCreated(newMappedOrder);
            }

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <details style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', cursor: 'pointer' }}>
            <summary style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.2rem', outline: 'none' }}>
                Toggle Manual POS Order Entry
            </summary>
            
            <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()} style={{ cursor: 'default' }}>
                {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                
                <div className={styles.formGroup} style={{ position: 'relative' }}>
                    <label>Search Customer (Name, Phone, Email, or ID)</label>
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            // Also sync to telegramId directly if they are typing an ID manually
                            setTelegramId(e.target.value);
                        }} 
                        onFocus={() => { if(searchResults.length > 0) setShowResults(true); }}
                        placeholder="Type to search..."
                        style={{ width: '100%', padding: '0.5rem', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                    />
                    
                    {showResults && searchResults.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#333', border: '1px solid #444', borderRadius: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                            {searchResults.map((res, i) => (
                                <div 
                                    key={`${res.type}-${res.id}-${i}`} 
                                    onClick={() => handleSelectCustomer(res)}
                                    style={{ padding: '0.75rem', borderBottom: '1px solid #444', cursor: 'pointer', background: '#333' }}
                                    onMouseOver={e => e.currentTarget.style.background = '#444'}
                                    onMouseOut={e => e.currentTarget.style.background = '#333'}
                                >
                                    <div style={{ fontWeight: 'bold', color: '#fff' }}>{res.displayName}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{res.subLabel}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <small style={{color: '#888', display: 'block', marginTop: '4px'}}>Selected ID: {telegramId || 'None (Anonymous)'}</small>
                </div>

                <div style={{ border: '1px solid #333', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', background: '#0a0a0a' }}>
                    <h4>Add Items</h4>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select 
                            style={{ flex: 2, padding: '0.5rem', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', minWidth: '150px' }}
                            value={selectedProduct}
                            onChange={(e) => {
                                setSelectedProduct(e.target.value);
                                setSelectedModelIndex(0);
                            }}
                        >
                            <option value="">-- Select Product --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>

                        {productObj && productObj.models && (
                            <select 
                                style={{ flex: 1, padding: '0.5rem', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', minWidth: '150px' }}
                                value={selectedModelIndex}
                                onChange={e => setSelectedModelIndex(parseInt(e.target.value))}
                            >
                                {productObj.models.map((m, idx) => {
                                    const isOutOfStock = m.stock <= 0;
                                    return (
                                        <option 
                                            key={idx} 
                                            value={idx} 
                                            disabled={isOutOfStock}
                                            style={{ color: isOutOfStock ? '#666' : '#fff' }}
                                        >
                                            {m.name} ({m.size}) - {isOutOfStock ? '(Out of Stock)' : `EGP ${m.price}`}
                                        </option>
                                    );
                                })}
                            </select>
                        )}
                        
                        <button type="button" className="btn" onClick={handleAddItem} disabled={!selectedProduct || (productObj?.models?.[selectedModelIndex]?.stock <= 0)}>+ Add</button>
                    </div>

                    {orderItems.length > 0 && (
                        <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #333' }}>
                                        <th style={{ padding: '0.5rem' }}>Item</th>
                                        <th style={{ padding: '0.5rem' }}>Qty</th>
                                        <th style={{ padding: '0.5rem' }}>Price</th>
                                        <th style={{ padding: '0.5rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #222' }}>
                                            <td style={{ padding: '0.5rem' }}>{item.name}</td>
                                            <td style={{ padding: '0.5rem' }}>
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    max={item.availableStock}
                                                    value={item.quantity} 
                                                    onChange={e => handleUpdateQuantity(idx, parseInt(e.target.value) || 1)}
                                                    style={{ width: '60px', padding: '0.25rem', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem' }}>EGP {item.price}</td>
                                            <td style={{ padding: '0.5rem' }}>
                                                <button type="button" onClick={() => handleRemoveItem(idx)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ marginTop: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                                Total: EGP {orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)}
                            </div>
                        </div>
                    )}
                </div>

                <button type="submit" className="btn" style={{ width: '100%', background: 'var(--color-accent)', color: '#000' }} disabled={loading || orderItems.length === 0}>
                    {loading ? 'Processing...' : 'Complete Order'}
                </button>
            </form>
        </details>
    );
}
