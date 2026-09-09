
import React from 'react';
import styles from '../admin.module.css';
import { BRANDS } from '@/lib/data';

export default function AdminAttributesTab({
    persistentAttributes, setPersistentAttributes,
    hiddenAttributes, setHiddenAttributes,
    attributeMetadata, setAttributeMetadata,
    newAttributeForm, setNewAttributeForm,
    autoHideStock, setAutoHideStock,
    products
}) {
    return (
                    <div className={styles.content}>
                        <div style={{ width: '100%', margin: '0 auto', background: '#121110', padding: '2rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                            <h2>Manage Persistent Attributes</h2>

                            {/* Brand Addition Form (Phase 5 SVG Support) */}
                            <div style={{ background: '#222', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', marginTop: '1rem' }}>
                                <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Add New Brand (SVG Logo)</h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Brand Name</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={newAttributeForm.value}
                                            onChange={(e) => setNewAttributeForm({ ...newAttributeForm, value: e.target.value })}
                                            placeholder="e.g. Montecristo"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div className={styles.fileUploadWrapper}>
                                            <span className={styles.fileUploadLabel}>[ 🖼️ UPLOAD SVG ]</span>
                                            <input
                                                type="file"
                                                accept=".svg, image/svg+xml"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    if (!file.name.toLowerCase().endsWith('.svg') && !file.type.includes('svg')) {
                                                        alert('Please upload an SVG file for crisp brand rendering.');
                                                        return;
                                                    }
                                                    setUploadingImage(true);
                                                    const fb = new FormData();
                                                    fb.append('file', file);
                                                    try {
                                                        const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fb });
                                                        const data = await res.json();
                                                        if (data.url) {
                                                            setNewAttributeForm(prev => ({ ...prev, image: data.url }));
                                                        }
                                                    } catch (err) {
                                                        alert('Upload failed: ' + err.message);
                                                    }
                                                    setUploadingImage(false);
                                                }}
                                                className={styles.hiddenFileInput}
                                                disabled={uploadingImage}
                                                title="Upload SVG Logo"
                                            />
                                        </div>
                                        {newAttributeForm.image && (
                                            <div style={{ width: '40px', height: '40px', background: '#000', borderRadius: '4px', padding: '4px' }}>
                                                <img src={newAttributeForm.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <button
                                            onClick={async () => {
                                                if (!newAttributeForm.value || newAttributeForm.value.trim() === '') {
                                                    alert('Brand name is required.');
                                                    return;
                                                }
                                                const cleanedVal = newAttributeForm.value.trim();
                                                try {
                                                    const metadata = newAttributeForm.image ? { image: newAttributeForm.image } : {};
                                                    const res = await fetch('/api/admin/attributes', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ category: 'brand', value: cleanedVal, metadata })
                                                    });
                                                    if (res.ok) {
                                                        const data = await res.json();
                                                        setPersistentAttributes(prev => ({
                                                            ...prev,
                                                            brand: [...(prev.brand || []), cleanedVal].sort()
                                                        }));
                                                        if (metadata.image) {
                                                            setAttributeMetadata(prev => ({
                                                                ...prev,
                                                                [cleanedVal]: { ...(prev[cleanedVal] || {}), image: metadata.image, id: data.data?.id }
                                                            }));
                                                        }
                                                        setNewAttributeForm({ category: 'brand', value: '', image: '' });
                                                    } else {
                                                        const errData = await res.json();
                                                        alert('Failed to add brand: ' + (errData.error || 'Unknown Error'));
                                                    }
                                                } catch (e) {
                                                    alert('Error adding brand: ' + e.message);
                                                }
                                            }}
                                            style={{ background: 'var(--color-accent)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Save Brand
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
                                {Object.keys(persistentAttributes).length === 0 ? (
                                    <p style={{ color: '#888' }}>No persistent attributes found.</p>
                                ) : null}
                                {(() => {
                                    const combinedAttributesList = {
                                        brand: Array.from(new Set([...BRANDS.map(b => b.id), ...(persistentAttributes.brand || []), ...products.map(p => p.brandId || p.brand_id).filter(Boolean)])).filter(v => !hiddenAttributes.brand?.includes(v)).sort(),
                                        origin: dynamicOptions.allOrigins?.filter(v => !hiddenAttributes.origin?.includes(v)),
                                        size: dynamicOptions.allSizes?.filter(v => !hiddenAttributes.size?.includes(v)),
                                        variant: dynamicOptions.allVariants?.filter(v => !hiddenAttributes.variant?.includes(v)),
                                        dimension: dynamicOptions.allDimensions?.filter(v => !hiddenAttributes.dimension?.includes(v)),
                                        category: Array.from(new Set(['cigar', 'cigarillo', 'accessory', 'sampler', 'bundle', ...(persistentAttributes.category || []), ...products.map(p => p.category).filter(Boolean)])).filter(v => !hiddenAttributes.category?.includes(v)).sort(),
                                        flavor: allFlavorOptions?.filter(v => !hiddenAttributes.flavor?.includes(v)),
                                        gift_option: persistentAttributes.gift_option || [],
                                        series: dynamicOptions.allSeries?.filter(v => !hiddenAttributes.series?.includes(v))
                                    };

                                    return Object.entries(combinedAttributesList).map(([category, values]) => (
                                        <div key={category} style={{ background: '#121110', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                                            <h3 style={{ textTransform: 'capitalize', color: 'var(--color-accent)', marginBottom: '1rem' }}>{category}</h3>
                                            {(!values || values.length === 0) ? (
                                                <p style={{ color: '#888', fontSize: '0.9rem' }}>No {category}s found.</p>
                                            ) : (
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto', alignContent: 'flex-start' }}>
                                                    {values.map(val => {
                                                        const isPersistent = persistentAttributes[category]?.includes(val);
                                                        return (
                                                            <li key={val} style={{ background: isPersistent ? '#333' : '#444', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                {val}
                                                                <button
                                                                    onClick={async () => {
                                                                        if (category === 'brand') {
                                                                            setEditingBrand({
                                                                                category, 
                                                                                oldVal: val, 
                                                                                value: val, 
                                                                                image: attributeMetadata[val]?.image || '',
                                                                                isPersistent: isPersistent, 
                                                                                id: attributeMetadata[val]?.id
                                                                            });
                                                                            return;
                                                                        }
                                                                        const newVal = prompt(`Edit ${category} "${val}":`, val);
                                                                        if (!newVal || newVal.trim() === '' || newVal === val) return;
                                                                        const cleanedVal = newVal.trim();
                                                                        try {
                                                                            const attrMeta = attributeMetadata[val];
                                                                            if (attrMeta && attrMeta.id) {
                                                                                // Persistent attribute with known ID -> PUT
                                                                                const res = await fetch('/api/admin/attributes', {
                                                                                    method: 'PUT',
                                                                                    headers: { 'Content-Type': 'application/json' },
                                                                                    body: JSON.stringify({ id: attrMeta.id, category, value: cleanedVal, metadata: attrMeta })
                                                                                });
                                                                                if (!res.ok) {
                                                                                    const err = await res.json();
                                                                                    throw new Error(err.error || 'Failed to update');
                                                                                }
                                                                                // Update state
                                                                                setPersistentAttributes(prev => ({
                                                                                    ...prev,
                                                                                    [category]: prev[category].map(v => v === val ? cleanedVal : v)
                                                                                }));
                                                                                setAttributeMetadata(prev => {
                                                                                    const next = { ...prev };
                                                                                    next[cleanedVal] = { ...next[val], id: attrMeta.id };
                                                                                    delete next[val];
                                                                                    return next;
                                                                                });
                                                                            } else {
                                                                                // Dynamic attribute -> Create Custom & Hide Old
                                                                                const resAdd = await fetch('/api/admin/attributes', {
                                                                                    method: 'POST',
                                                                                    headers: { 'Content-Type': 'application/json' },
                                                                                    body: JSON.stringify({ category, value: cleanedVal, metadata: {} })
                                                                                });
                                                                                if (!resAdd.ok) throw new Error('Failed to create new attribute.');

                                                                                const resHide = await fetch('/api/admin/attributes', {
                                                                                    method: 'POST',
                                                                                    headers: { 'Content-Type': 'application/json' },
                                                                                    body: JSON.stringify({ category, value: val, metadata: { hidden: true } })
                                                                                });
                                                                                if (!resHide.ok) throw new Error('Failed to hide old attribute.');

                                                                                setPersistentAttributes(prev => ({
                                                                                    ...prev,
                                                                                    [category]: [...(prev[category] || []), cleanedVal]
                                                                                }));
                                                                                setHiddenAttributes(prev => ({
                                                                                    ...prev,
                                                                                    [category]: [...(prev[category] || []), val]
                                                                                }));
                                                                            }
                                                                        } catch (e) {
                                                                            alert('Error editing attribute: ' + e.message);
                                                                        }
                                                                    }}
                                                                    style={{ background: 'none', border: 'none', color: '#ffb347', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', marginLeft: 'auto' }}
                                                                    title="Edit"
                                                                >
                                                                    ✎
                                                                </button>
                                                                {true && (
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (!confirm(`Delete ${category} "${val}"?`)) return;
                                                                            try {
                                                                                if (isPersistent) {
                                                                                    const res = await fetch(`/api/admin/attributes?category=${category}&value=${encodeURIComponent(val)}`, { method: 'DELETE' });
                                                                                    if (res.ok) {
                                                                                        setPersistentAttributes(prev => ({
                                                                                            ...prev,
                                                                                            [category]: prev[category].filter(v => v !== val)
                                                                                        }));
                                                                                    } else {
                                                                                        const errData = await res.json();
                                                                                        alert('Failed to delete attribute: ' + (errData.error || 'Unknown Error'));
                                                                                    }
                                                                                } else {
                                                                                    const res = await fetch('/api/admin/attributes', {
                                                                                        method: 'POST',
                                                                                        headers: { 'Content-Type': 'application/json' },
                                                                                        body: JSON.stringify({ category, value: val, metadata: { hidden: true } })
                                                                                    });
                                                                                    if (res.ok) {
                                                                                        setHiddenAttributes(prev => ({
                                                                                            ...prev,
                                                                                            [category]: [...(prev[category] || []), val]
                                                                                        }));
                                                                                    } else {
                                                                                        const errData = await res.json();
                                                                                        alert('Failed to hide attribute: ' + (errData.error || 'Unknown Error'));
                                                                                    }
                                                                                }
                                                                            } catch (e) {
                                                                                alert('Error deleting attribute: ' + e.message);
                                                                            }
                                                                        }}
                                                                        style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold' }}
                                                                    >×</button>
                                                                )}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                            {/* Inline Add Button for Category */}
                                            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                                <button
                                                    onClick={async () => {
                                                        const newVal = prompt(`Add new ${category}:`);
                                                        if (!newVal || newVal.trim() === '') return;
                                                        const cleanedVal = newVal.trim();
                                                        try {
                                                            const res = await fetch('/api/admin/attributes', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ category, value: cleanedVal, metadata: {} })
                                                            });
                                                            if (res.ok) {
                                                                setPersistentAttributes(prev => ({
                                                                    ...prev,
                                                                    [category]: [...(prev[category] || []), cleanedVal]
                                                                }));
                                                            } else {
                                                                const errData = await res.json();
                                                                alert('Failed to add attribute: ' + (errData.error || 'Unknown Error'));
                                                            }
                                                        } catch (e) {
                                                            alert('Error adding attribute: ' + e.message);
                                                        }
                                                    }}
                                                    style={{ background: 'var(--color-accent)', color: '#000', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                                                >
                                                    + Add {category}
                                                </button>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>

                            <hr style={{ borderColor: '#333', margin: '3rem 0' }} />

                            <h2>Gift Packaging Options</h2>
                            <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                Define global gift options that users can select when purchasing items that have &quot;Include Gift Packaging Options&quot; checked.
                            </p>

                            {/* Create Gift Option Form */}
                            <div style={{ background: '#121110', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', marginBottom: '2rem' }}>
                                <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Add New Gift Option</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Option Name</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={giftOptionForm.name}
                                            onChange={(e) => setGiftOptionForm(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="e.g. Premium Cedar Box"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Extra Price (EGP)</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={giftOptionForm.price}
                                            onChange={(e) => setGiftOptionForm(prev => ({ ...prev, price: e.target.value }))}
                                            placeholder="150"
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Brief Description</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={giftOptionForm.description}
                                            onChange={(e) => setGiftOptionForm(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="A beautifully crafted..."
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <input type="file" accept="image/*" onChange={handleGiftImageUpload} className="file:bg-white file:text-[#120C0A] file:px-4 file:py-2 file:rounded-full file:border-none file:font-semibold file:cursor-pointer hover:file:bg-[#C5A35C] transition-all" disabled={uploadingGiftImage} title="Upload Image" />
                                        {giftOptionForm.image && (
                                            <img src={giftOptionForm.image} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                        )}
                                    </div>
                                    <div>
                                        <button onClick={handleSaveGiftOption} style={{ background: 'var(--color-accent)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                                            {editingGiftId ? 'Update Gift Option' : 'Save Gift Option'}
                                        </button>
                                        {editingGiftId && (
                                            <button onClick={() => { setEditingGiftId(null); setEditingGiftOldName(null); setGiftOptionForm({ name: '', price: '', description: '', image: '' }); }} style={{ background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '5px' }}>
                                                Cancel Edit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Existing Gift Options List */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                {!(persistentAttributes.gift_option && persistentAttributes.gift_option.length > 0) ? (
                                    <p style={{ color: '#888' }}>No gift options created yet.</p>
                                ) : (
                                    persistentAttributes.gift_option.map(optionName => {
                                        const meta = attributeMetadata[optionName] || {};
                                        return (
                                            <div key={optionName} style={{ background: '#121110', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
                                                {meta.image && (
                                                    <div style={{ height: '140px', background: '#000' }}>
                                                        <img src={meta.image} alt={optionName} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                                    </div>
                                                )}
                                                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <h4 style={{ margin: 0, color: '#fff' }}>{optionName}</h4>
                                                        <strong style={{ color: 'var(--color-accent)' }}>+ EGP {meta.price || 0}</strong>
                                                    </div>
                                                    {meta.description && <p style={{ fontSize: '0.85rem', color: '#aaa', margin: 0, flex: 1 }}>{meta.description}</p>}

                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm(`Delete gift option "${optionName}"?`)) return;
                                                                try {
                                                                    const res = await fetch(`/api/admin/attributes?category=gift_option&value=${encodeURIComponent(optionName)}`, { method: 'DELETE' });
                                                                    if (res.ok) {
                                                                        setPersistentAttributes(prev => ({
                                                                            ...prev,
                                                                            gift_option: prev.gift_option.filter(v => v !== optionName)
                                                                        }));
                                                                    } else {
                                                                        alert('Failed to delete.');
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            }}
                                                            style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4d', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', flex: 1, fontWeight: 'bold' }}
                                                        >
                                                            Remove
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingGiftId(meta.id);
                                                                setEditingGiftOldName(optionName);
                                                                setGiftOptionForm({
                                                                    name: optionName,
                                                                    price: meta.price || 0,
                                                                    description: meta.description || '',
                                                                    image: meta.image || ''
                                                                });
                                                                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                                            }}
                                                            style={{ background: 'transparent', color: 'var(--color-accent)', border: '1px solid var(--color-accent)', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', flex: 1, fontWeight: 'bold' }}
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Checkout Settings Section */}
                        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #333' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2>Checkout Settings</h2>
                                    <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>
                                        Configure store-wide settings for the checkout process.
                                    </p>
                                </div>
                            </div>
                            
                            <div style={{ background: '#121110', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Require Payment Receipts (Instapay/Vodafone)</label>
                                <select 
                                    value={(() => {
                                        let mode = 'none';
                                        try {
                                            const settings = JSON.parse(persistentAttributes.checkout_settings || '{}');
                                            mode = settings.receipt_requirement_mode || 'none';
                                        } catch(e) {
                                            if (typeof persistentAttributes.checkout_settings === 'string') {
                                                mode = persistentAttributes.checkout_settings;
                                            }
                                        }
                                        return mode;
                                    })()}
                                    onChange={async (e) => {
                                        const newMode = e.target.value;
                                        try {
                                            const metadata = { receipt_requirement_mode: newMode };
                                            const res = await fetch('/api/admin/attributes', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ category: 'checkout_settings', value: JSON.stringify(metadata) })
                                            });
                                            if (res.ok) {
                                                setPersistentAttributes(prev => ({ ...prev, checkout_settings: JSON.stringify(metadata) }));
                                                alert('Settings updated successfully.');
                                            } else {
                                                alert('Failed to update settings.');
                                            }
                                        } catch(error) {
                                            alert('Error updating settings.');
                                        }
                                    }}
                                    className="inputField"
                                    style={{ width: '100%', maxWidth: '400px' }}
                                >
                                    <option value="none">None (Optional for all)</option>
                                    <option value="all">All (Strictly required for everyone)</option>
                                    <option value="specific">Specific Customers</option>
                                </select>
                                <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '1rem', lineHeight: '1.5' }}>
                                    If set to <strong>None</strong>, users will only see a gentle notification asking them to upload, but they can skip it. <br/>
                                    If set to <strong>All</strong>, users cannot place an order with Instapay/Vodafone without uploading the receipt image. <br/>
                                    If set to <strong>Specific Customers</strong>, the strict block only applies to the users you select below.
                                </p>

                                {(() => {
                                    let settings = {};
                                    try {
                                        settings = JSON.parse(persistentAttributes.checkout_settings || '{}');
                                    } catch(e) {
                                        if (typeof persistentAttributes.checkout_settings === 'string') {
                                            settings = { receipt_requirement_mode: persistentAttributes.checkout_settings };
                                        }
                                    }
                                    const mode = settings.receipt_requirement_mode || 'none';
                                    const restrictedEmails = settings.restricted_emails || [];

                                    if (mode === 'specific') {
                                        return (
                                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #333' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Targeted Customers</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Search customers by name or email..." 
                                                    value={checkoutCustomerSearch} 
                                                    onChange={e => setCheckoutCustomerSearch(e.target.value)}
                                                    className="inputField"
                                                    style={{ width: '100%', maxWidth: '400px', marginBottom: '0.5rem' }}
                                                />
                                                <div style={{ maxWidth: '600px', maxHeight: '200px', overflowX: 'hidden', overflowY: 'auto', background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {adminUsers.filter(c => c.name?.toLowerCase().includes(checkoutCustomerSearch.toLowerCase()) || c.email?.toLowerCase().includes(checkoutCustomerSearch.toLowerCase())).map(c => (
                                                        <label key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', width: '100%', padding: '12px 16px', cursor: 'pointer', background: restrictedEmails.includes(c.email) ? 'rgba(197, 163, 92, 0.2)' : 'transparent', borderBottom: '1px solid #444', fontSize: '0.9rem' }}>
                                                            <span style={{ textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{c.name || 'N/A'} ({c.email})</span>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={restrictedEmails.includes(c.email)} 
                                                                onChange={async () => {
                                                                    const newEmails = restrictedEmails.includes(c.email) 
                                                                        ? restrictedEmails.filter(email => email !== c.email)
                                                                        : [...restrictedEmails, c.email];
                                                                        
                                                                    const metadata = { ...settings, restricted_emails: newEmails };
                                                                    
                                                                    try {
                                                                        const res = await fetch('/api/admin/attributes', {
                                                                            method: 'POST',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ category: 'checkout_settings', value: JSON.stringify(metadata) })
                                                                        });
                                                                        if (res.ok) {
                                                                            setPersistentAttributes(prev => ({ ...prev, checkout_settings: JSON.stringify(metadata) }));
                                                                        }
                                                                    } catch(err) {
                                                                        console.error(err);
                                                                        alert('Failed to update targeted customer list');
                                                                    }
                                                                }}
                                                                style={{ justifySelf: 'end', cursor: 'pointer', transform: 'scale(1.2)' }}
                                                            />
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>
                    </div>
                
    );
}
