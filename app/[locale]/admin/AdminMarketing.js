'use client';
import { useState, useEffect } from 'react';
export default function AdminMarketing() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    
    // URL Builder
    const [linkType, setLinkType] = useState('custom'); // custom, product, brand
    const [linkIds, setLinkIds] = useState([]);
    const [customUrl, setCustomUrl] = useState('/');
    const [targetSearch, setTargetSearch] = useState('');
    
    // Visuals
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Targeting
    const [targetType, setTargetType] = useState('all'); // all, specific, vip
    const [targetEmails, setTargetEmails] = useState([]);
    const [targetTiers, setTargetTiers] = useState([]);
    const [status, setStatus] = useState('');
    const [customers, setCustomers] = useState([]);

    const VIP_TIERS = [
        { id: 2, name: 'Silver' },
        { id: 3, name: 'Gold' },
        { id: 4, name: 'Platinum' },
        { id: 5, name: 'Diamond' }
    ];

    const toggleEmail = (email) => {
        setTargetEmails(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
    };
    
    const toggleTier = (id) => {
        setTargetTiers(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    // Data for dropdowns
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);

    useEffect(() => {
        // Fetch Products
        fetch('/api/products').then(res => res.json()).then(data => {
            if(Array.isArray(data)) setProducts(data);
            else if(data.products) setProducts(data.products);
        });
        // Fetch Brands
        fetch('/api/brands').then(res => res.json()).then(data => {
            if(Array.isArray(data)) setBrands(data);
            else if(data.brands) setBrands(data.brands);
        });
        // Fetch Users
        fetch('/api/admin/users', { headers: { 'Authorization': 'Bearer admin@129' } }).then(res => res.json()).then(data => {
            if(data.users) setCustomers(data.users);
            else if(Array.isArray(data)) setCustomers(data);
        });
    }, []);

    const handleImageUpload = async (e, callback = setImageUrl) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'products'); // Reuse products bucket for now

        try {
            const res = await fetch('/api/admin/upload-image', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer admin@129' },
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                callback(data.url);
            } else {
                alert('Image upload failed');
            }
        } catch (err) {
            console.error(err);
            alert('Upload error');
        }
        setIsUploading(false);
    };

    const handleSendPush = async (e) => {
        e.preventDefault();
        setStatus('Sending...');

        let finalUrl = customUrl;
        if (linkType === 'product') finalUrl = `/product/${linkIds.join(',')}`;
        if (linkType === 'brand') finalUrl = `/shop?brand=${linkIds.join(',')}`;

        if (targetType === 'specific' && targetEmails.length === 0) {
            setStatus('Please select at least one customer.');
            return;
        }
        if (targetType === 'vip' && targetTiers.length === 0) {
            setStatus('Please select at least one VIP tier.');
            return;
        }

        try {
            const res = await fetch('/api/admin/push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer admin@129'
                },
                body: JSON.stringify({
                    title,
                    body: message,
                    icon: imageUrl,
                    url: finalUrl,
                    targetType,
                    targetEmails,
                    targetTiers
                })
            });

            const data = await res.json();
            if (data.success) {
                setStatus(`Success! Sent to ${data.successCount} subscribers. Failed: ${data.failCount}.`);
            } else {
                setStatus(`Error: ${data.error}`);
            }
        } catch (err) {
            setStatus('An unexpected error occurred.');
        }
    };

    const toggleTarget = (id) => {
        setLinkIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    const inputStyle = { width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', color: '#fff' }}>
            <h1 style={{ color: '#D4AF37', marginBottom: '1rem' }}>Marketing & Notifications</h1>
            <p style={{ color: '#ccc', marginBottom: '2rem' }}>Broadcast Advanced Web Push Notifications.</p>

            <form onSubmit={handleSendPush} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#1a1a1a', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                
                {/* 1. Message Content */}
                <div>
                    <h3 style={{ color: '#D4AF37', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>1. Message Content</h3>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notification Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} placeholder="e.g. New Arrival: Opus X!" />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Message Body</label>
                        <textarea value={message} onChange={e => setMessage(e.target.value)} required rows="3" style={inputStyle} placeholder="The highly anticipated shipment has arrived..." />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Image URL (Optional)</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="https://example.com/image.png" />
                            <label style={{ background: '#333', padding: '0.8rem 1rem', borderRadius: '4px', cursor: 'pointer', border: '1px solid #555' }}>
                                {isUploading ? 'Uploading...' : 'Upload File'}
                                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* 2. Destination URL */}
                <div>
                    <h3 style={{ color: '#D4AF37', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>2. Destination Link</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <label><input type="radio" checked={linkType === 'custom'} onChange={() => setLinkType('custom')} /> Custom URL</label>
                        <label><input type="radio" checked={linkType === 'product'} onChange={() => { setLinkType('product'); setLinkIds([]); }} /> Specific Product(s)</label>
                        <label><input type="radio" checked={linkType === 'brand'} onChange={() => { setLinkType('brand'); setLinkIds([]); }} /> Specific Brand(s)</label>
                    </div>
                    {linkType === 'custom' && (
                        <input type="text" value={customUrl} onChange={e => setCustomUrl(e.target.value)} style={inputStyle} placeholder="/shop" />
                    )}
                    {linkType === 'product' && (
                        <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={targetSearch} 
                                onChange={e => setTargetSearch(e.target.value)}
                                style={{ ...inputStyle, marginBottom: '0.5rem' }}
                            />
                            <div style={{ maxHeight: '250px', overflowX: 'hidden', overflowY: 'auto', background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {products.filter(p => p.name.toLowerCase().includes(targetSearch.toLowerCase())).map(p => (
                                    <label key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', width: '100%', padding: '12px 16px', cursor: 'pointer', background: linkIds.includes(String(p.id)) ? 'rgba(197, 163, 92, 0.2)' : 'transparent', borderBottom: '1px solid #444', fontSize: '0.9rem' }}>
                                        <span style={{ textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{p.name}</span>
                                        <input 
                                            type="checkbox" 
                                            checked={linkIds.includes(String(p.id))} 
                                            onChange={() => toggleTarget(String(p.id))}
                                            style={{ justifySelf: 'end', cursor: 'pointer', transform: 'scale(1.2)' }}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    {linkType === 'brand' && (
                        <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                            <input 
                                type="text" 
                                placeholder="Search brands..." 
                                value={targetSearch} 
                                onChange={e => setTargetSearch(e.target.value)}
                                style={{ ...inputStyle, marginBottom: '0.5rem' }}
                            />
                            <div style={{ maxHeight: '250px', overflowX: 'hidden', overflowY: 'auto', background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {brands.filter(b => b.name?.toLowerCase().includes(targetSearch.toLowerCase())).map(b => (
                                    <label key={b.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', width: '100%', padding: '12px 16px', cursor: 'pointer', background: linkIds.includes(b.id) ? 'rgba(197, 163, 92, 0.2)' : 'transparent', borderBottom: '1px solid #444', fontSize: '0.9rem' }}>
                                        <span style={{ textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{b.name}</span>
                                        <input 
                                            type="checkbox" 
                                            checked={linkIds.includes(b.id)} 
                                            onChange={() => toggleTarget(b.id)}
                                            style={{ justifySelf: 'end', cursor: 'pointer', transform: 'scale(1.2)' }}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Audience Targeting */}
                <div>
                    <h3 style={{ color: '#D4AF37', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>3. Audience Targeting</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <label><input type="radio" checked={targetType === 'all'} onChange={() => setTargetType('all')} /> All Subscribed Customers</label>
                        <label><input type="radio" checked={targetType === 'specific'} onChange={() => setTargetType('specific')} /> Specific Customer</label>
                        <label><input type="radio" checked={targetType === 'vip'} onChange={() => setTargetType('vip')} /> VIP / Loyal Only</label>
                    </div>
                    {targetType === 'specific' && (
                        <div style={{ maxHeight: '250px', overflowX: 'hidden', overflowY: 'auto', background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {customers.map(c => (
                                <label key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', width: '100%', padding: '12px 16px', cursor: 'pointer', background: targetEmails.includes(c.email) ? 'rgba(197, 163, 92, 0.2)' : 'transparent', borderBottom: '1px solid #444', fontSize: '0.9rem' }}>
                                    <span style={{ textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{c.name} ({c.email})</span>
                                    <input 
                                        type="checkbox" 
                                        checked={targetEmails.includes(c.email)} 
                                        onChange={() => toggleEmail(c.email)}
                                        style={{ justifySelf: 'end', cursor: 'pointer', transform: 'scale(1.2)' }}
                                    />
                                </label>
                            ))}
                        </div>
                    )}
                    {targetType === 'vip' && (
                        <div style={{ maxHeight: '250px', overflowX: 'hidden', overflowY: 'auto', background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {VIP_TIERS.map(t => (
                                <label key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', width: '100%', padding: '12px 16px', cursor: 'pointer', background: targetTiers.includes(t.id) ? 'rgba(197, 163, 92, 0.2)' : 'transparent', borderBottom: '1px solid #444', fontSize: '0.9rem' }}>
                                    <span style={{ textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{t.name}</span>
                                    <input 
                                        type="checkbox" 
                                        checked={targetTiers.includes(t.id)} 
                                        onChange={() => toggleTier(t.id)}
                                        style={{ justifySelf: 'end', cursor: 'pointer', transform: 'scale(1.2)' }}
                                    />
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-accent)', color: '#120C0A', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', textTransform: 'uppercase' }}>
                    🚀 Send Broadcast Notification
                </button>
            </form>

            {status && (
                <div style={{ marginTop: '2rem', padding: '1rem', background: '#333', borderRadius: '4px', borderLeft: '4px solid var(--color-accent)' }}>
                    {status}
                </div>
            )}

            <hr style={{ borderColor: '#333', margin: '3rem 0' }} />

            <h2 style={{ color: '#D4AF37', marginBottom: '1rem' }}>Birthday Automations Configuration</h2>
            <p style={{ color: '#ccc', marginBottom: '2rem' }}>Customize the automated Push Notifications sent for Birthdays.</p>
            
            <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Day-Of Birthday Message</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    <input type="text" id="bday_title" defaultValue="Happy Birthday from CigarLounge! 🎉" style={inputStyle} placeholder="Title" />
                    <textarea id="bday_body" defaultValue="Wishing you a fantastic day! Enjoy an exclusive Birthday Gift added to your account." rows="2" style={inputStyle} placeholder="Body" />
                    <input type="text" id="bday_url" defaultValue="/shop" style={inputStyle} placeholder="Target URL (e.g. /shop?promo=BDAY)" />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input type="text" id="bday_image" defaultValue="https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=800" style={{ ...inputStyle, flex: 1 }} placeholder="Image URL" />
                        <label style={{ background: '#333', padding: '0.8rem 1rem', borderRadius: '4px', cursor: 'pointer', border: '1px solid #555' }}>
                            Upload File
                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageUpload(e, (url) => document.getElementById('bday_image').value = url)} />
                        </label>
                    </div>
                </div>

                <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Upcoming Birthday (5 Days Prior)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    <input type="text" id="up_bday_title" defaultValue="Your Birthday is almost here! 🎂" style={inputStyle} placeholder="Title" />
                    <textarea id="up_bday_body" defaultValue="Stock up now so you have the perfect smoke ready to celebrate your special day." rows="2" style={inputStyle} placeholder="Body" />
                    <input type="text" id="up_bday_url" defaultValue="/shop" style={inputStyle} placeholder="Target URL" />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input type="text" id="up_bday_image" defaultValue="https://images.unsplash.com/photo-1527005980469-e1724f6e1f0e?auto=format&fit=crop&q=80&w=800" style={{ ...inputStyle, flex: 1 }} placeholder="Image URL" />
                        <label style={{ background: '#333', padding: '0.8rem 1rem', borderRadius: '4px', cursor: 'pointer', border: '1px solid #555' }}>
                            Upload File
                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageUpload(e, (url) => document.getElementById('up_bday_image').value = url)} />
                        </label>
                    </div>
                </div>

                <button onClick={async () => {
                    const bdayVal = {
                        title: document.getElementById('bday_title').value,
                        body: document.getElementById('bday_body').value,
                        url: document.getElementById('bday_url').value,
                        image: document.getElementById('bday_image').value,
                        enabled: true
                    };
                    const upBdayVal = {
                        title: document.getElementById('up_bday_title').value,
                        body: document.getElementById('up_bday_body').value,
                        url: document.getElementById('up_bday_url').value,
                        image: document.getElementById('up_bday_image').value,
                        enabled: true
                    };
                    
                    try {
                        await fetch('/api/admin/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin@129' },
                            body: JSON.stringify({ key: 'birthday_automation', value: bdayVal })
                        });
                        await fetch('/api/admin/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin@129' },
                            body: JSON.stringify({ key: 'upcoming_birthday_automation', value: upBdayVal })
                        });
                        alert('Birthday settings saved successfully!');
                    } catch (e) {
                        alert('Error saving. Ensure system_settings table exists.');
                    }
                }} style={{ padding: '1rem', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Save Automation Settings
                </button>
            </div>
        </div>
    );
}
