import React, { useState, useEffect, useRef } from 'react';
import styles from './admin.module.css';

export default function AdminPromotions({ products, brands }) {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPromo, setEditingPromo] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    
    // Search States for Link Targets
    const [targetSearch, setTargetSearch] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        id: null,
        value: '', // Identifier string like hero_1
        position: 'hero_slider', // hero_slider, mosaic, promo_banner
        image: '',
        title: '',
        subtitle: '',
        link_type: 'product', // product, brand, custom
        link_target_products: [],
        link_target_brands: [],
        link_target_brands: [],
        custom_url: '',
        sponsor_images: [],
        sponsor_layout: 'top',
        active: true,
    });

    const positions = ['hero_slider', 'promo_banner', 'mosaic'];
    const linkTypes = ['product', 'brand', 'custom'];

    const resetForm = () => {
        setFormData({
            id: null,
            value: `promo_${Date.now()}`,
            position: 'hero_slider',
            image: '',
            title: '',
            subtitle: '',
            link_type: 'product',
            link_target_products: [],
            link_target_brands: [],
            custom_url: '',
            sponsor_images: [],
            sponsor_layout: 'top',
            active: true,
        });
        setEditingPromo(null);
    };

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/attributes?category=home_promotion');
            const json = await res.json();
            if (json.success) {
                setPromotions(json.data);
            }
        } catch (e) {
            console.error('Failed to fetch promos', e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleImageUpload = async (e) => {
        let file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        const fb = new FormData();
        fb.append('file', file);
        try {
            const res = await fetch('/api/admin/upload-image?intent=promo', { method: 'POST', body: fb });
            const data = await res.json();
            if (data.url) {
                setFormData(prev => ({ ...prev, image: data.url }));
            }
        } catch (err) {
            alert('Upload failed: ' + err.message);
        }
        setUploadingImage(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.image) return alert("You must upload an image/banner!");
        const payload = {
            category: 'home_promotion',
            value: formData.value || `promo_${Date.now()}`,
            metadata: {
                position: formData.position,
                image: formData.image,
                title: formData.title,
                subtitle: formData.subtitle,
                link_type: formData.link_type,
                link_target_products: formData.link_target_products,
                link_target_brands: formData.link_target_brands,
                custom_url: formData.custom_url,
                sponsor_images: formData.sponsor_images,
                sponsor_layout: formData.sponsor_layout,
                active: formData.active
            }
        };

        try {
            if (formData.id) {
                payload.id = formData.id;
                await fetch('/api/admin/attributes', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                await fetch('/api/admin/attributes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            alert('Promotion saved successfully!');
            fetchPromotions();
            resetForm();
        } catch (err) {
            alert('Error saving: ' + err.message);
        }
    };

    const handleDelete = async (id, value) => {
        if (!confirm('Delete this promotion?')) return;
        try {
            await fetch(`/api/admin/attributes?category=home_promotion&value=${value}`, {
                method: 'DELETE'
            });
            fetchPromotions();
        } catch (e) {
            alert('Failed to delete');
        }
    };

    const containerRef = useRef(null);

    const editPromo = (promo) => {
        setFormData({
            id: promo.id,
            value: promo.value,
            position: promo.metadata?.position || 'hero_slider',
            image: promo.metadata?.image || '',
            title: promo.metadata?.title || '',
            subtitle: promo.metadata?.subtitle || '',
            link_type: promo.metadata?.link_type || 'product',
            link_target_products: promo.metadata?.link_target_products || [],
            link_target_brands: promo.metadata?.link_target_brands || [],
            custom_url: promo.metadata?.custom_url || '',
            sponsor_images: promo.metadata?.sponsor_images || [],
            sponsor_layout: promo.metadata?.sponsor_layout || 'top',
            active: promo.metadata?.active !== false,
        });
        setEditingPromo(true);
        if (containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Toggle Multi-Select Array
    const toggleArrayItem = (key, itemVal) => {
        setFormData(prev => {
            const current = prev[key] || [];
            if (current.includes(itemVal)) {
                return { ...prev, [key]: current.filter(v => v !== itemVal) };
            }
            return { ...prev, [key]: [...current, itemVal] };
        });
    };

    return (
        <div className={styles.content} ref={containerRef}>
            <div style={{ width: '100%', margin: '0 auto', background: '#121110', padding: '2rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <h2>Manage Home Promotions</h2>
                <p style={{ color: '#888', marginBottom: '2rem' }}>Configure the dynamic banners on the homepage here. Use multiple product/brand selections to create specific routing destinations for each banner.</p>

                {/* Form */}
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', marginBottom: '3rem', border: '1px solid #333' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-accent)' }}>{editingPromo ? `Edit Promotion` : 'Add New Promotion'}</h3>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <div className={styles.formGroup} style={{ flex: 1, minWidth: '200px' }}>
                                <label>Position Area</label>
                                <select 
                                    value={formData.position} 
                                    onChange={e => setFormData({...formData, position: e.target.value})} 
                                    className={styles.input}
                                >
                                    <option value="hero_slider">1. Hero Slideshow (Top)</option>
                                    <option value="promo_banner">2. Standard Promo Block (Middle)</option>
                                    <option value="mosaic_1">3. Mosaic Tile 1 (Left Wide)</option>
                                    <option value="mosaic_2">4. Mosaic Tile 2 (Middle Box)</option>
                                    <option value="mosaic_3">5. Mosaic Tile 3 (Right Box)</option>
                                    <option value="sponsored_by">6. Sponsored By (Bottom)</option>
                                </select>
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1, minWidth: '200px' }}>
                                <label>Banner Internal ID</label>
                                <input 
                                    type="text" 
                                    value={formData.value} 
                                    onChange={e => setFormData({...formData, value: e.target.value})} 
                                    className={styles.input} 
                                    placeholder="e.g. spring_sale_1"
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className={styles.formGroup}>
                            <label>Banner Image (Panoramic for Slider, Square for Mosaics)</label>
                            {formData.image && (
                                <img src={formData.image} alt="Preview" style={{ maxWidth: '300px', maxHeight: '150px', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #333' }} />
                            )}
                            <div className={styles.fileUploadWrapper}>
                                <span className={styles.fileUploadLabel}>[ 📁 UPLOAD BANNER ]</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className={styles.hiddenFileInput}
                                />
                            </div>
                            {uploadingImage && <span style={{color: 'var(--color-accent)'}}>Uploading banner...</span>}
                        </div>

                        {/* Text Fields / Sponsor Fields */}
                        {formData.position === 'sponsored_by' ? (
                            <div style={{ padding: '1.5rem', background: '#111', borderRadius: '8px', border: '1px dashed #444' }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Sponsor Details</h4>
                                <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                                    <label>Sponsor Name / Title</label>
                                    <input type="text" className={styles.input} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. John Doe Corporation" />
                                </div>
                                <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                                    <label>Sponsor Description / Body Text</label>
                                    <textarea className={styles.input} value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} rows={5} placeholder="Write the full sponsor article here..." />
                                </div>
                                <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                                    <label>Main Image Layout</label>
                                    <select value={formData.sponsor_layout} onChange={e => setFormData({...formData, sponsor_layout: e.target.value})} className={styles.input}>
                                        <option value="top">Image on Top, Text Below</option>
                                        <option value="left">Image on Left, Text on Right</option>
                                        <option value="right">Text on Left, Image on Right</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Additional Photos (Gallery)</label>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        {formData.sponsor_images?.map((imgObj, i) => {
                                            const isString = typeof imgObj === 'string';
                                            const url = isString ? imgObj : imgObj.url;
                                            const layout = isString ? 'bottom_gallery' : (imgObj.layout || 'bottom_gallery');
                                            
                                            return (
                                                <div key={i} style={{ position: 'relative', border: '1px solid #333', padding: '0.5rem', borderRadius: '4px', background: '#0a0a0a' }}>
                                                    <img src={url} alt="Additional" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', display: 'block', marginBottom: '0.5rem' }} />
                                                    <select 
                                                        value={layout} 
                                                        onChange={(e) => {
                                                            const newLayout = e.target.value;
                                                            setFormData(prev => {
                                                                const newImages = [...(prev.sponsor_images || [])];
                                                                newImages[i] = { url, layout: newLayout };
                                                                return { ...prev, sponsor_images: newImages };
                                                            });
                                                        }}
                                                        className={styles.input}
                                                        style={{ width: '100%', padding: '0.2rem', fontSize: '0.75rem' }}
                                                    >
                                                        <option value="bottom_gallery">Gallery Grid</option>
                                                        <option value="inline_left">Inline Left</option>
                                                        <option value="inline_right">Inline Right</option>
                                                        <option value="full_width">Full Width Banner</option>
                                                    </select>
                                                    <button type="button" onClick={() => setFormData(prev => ({...prev, sponsor_images: prev.sponsor_images.filter((_, idx) => idx !== i)}))} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }}>&times;</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className={styles.fileUploadWrapper}>
                                        <span className={styles.fileUploadLabel}>[ 📁 ADD PHOTO ]</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                let file = e.target.files?.[0];
                                                if (!file) return;
                                                const fb = new FormData();
                                                fb.append('file', file);
                                                try {
                                                    const res = await fetch('/api/admin/upload-image?intent=promo', { method: 'POST', body: fb });
                                                    const data = await res.json();
                                                    if (data.url) {
                                                        setFormData(prev => ({ ...prev, sponsor_images: [...(prev.sponsor_images||[]), { url: data.url, layout: 'bottom_gallery' }] }));
                                                    }
                                                } catch (err) {
                                                    alert('Upload failed: ' + err.message);
                                                }
                                            }}
                                            className={styles.hiddenFileInput}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div className={styles.formGroup} style={{ flex: 1, minWidth: '200px' }}>
                                    <label>Title Overlay (Optional)</label>
                                    <input type="text" className={styles.input} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                                </div>
                                <div className={styles.formGroup} style={{ flex: 1, minWidth: '200px' }}>
                                    <label>Subtitle / Tag (Optional)</label>
                                    <input type="text" className={styles.input} value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
                                </div>
                            </div>
                        )}

                        {/* Action Linking Options */}
                        <div style={{ padding: '1.5rem', background: '#111', borderRadius: '8px', border: '1px dashed #444' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Banner Click Action</h4>
                            
                            <div className={styles.formGroup}>
                                <label>Link Type</label>
                                <select 
                                    value={formData.link_type} 
                                    onChange={e => setFormData({...formData, link_type: e.target.value})} 
                                    className={styles.input}
                                >
                                    <option value="product">Specific Product(s)</option>
                                    <option value="brand">Specific Brand(s)</option>
                                    <option value="gift">Specific Gift(s) / Accessories</option>
                                    <option value="custom">Custom URL Link</option>
                                </select>
                            </div>

                            {/* Specific Link Selection */}
                            {formData.link_type === 'product' && (
                                <div className={styles.formGroup}>
                                    <label>Select Item(s) to Route To (Cigars, Accessories, Samplers, etc. - Multi-Select)</label>
                                    <input 
                                        type="text" 
                                        placeholder="Search by name..." 
                                        value={targetSearch} 
                                        onChange={e => setTargetSearch(e.target.value)}
                                        style={{ width: '100%', marginBottom: '10px', padding: '8px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                                    />
                                    <div style={{ maxHeight: '250px', overflowX: 'hidden', overflowY: 'auto', background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {products.filter(p => p.name.toLowerCase().includes(targetSearch.toLowerCase())).map(p => (
                                            <label key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', width: '100%', padding: '12px 16px', cursor: 'pointer', background: formData.link_target_products.includes(String(p.id)) ? 'rgba(197, 163, 92, 0.2)' : 'transparent', borderBottom: '1px solid #444', fontSize: '0.9rem' }}>
                                                <span style={{ textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{p.name}</span>
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.link_target_products.includes(String(p.id))} 
                                                    onChange={() => toggleArrayItem('link_target_products', String(p.id))}
                                                    style={{ justifySelf: 'end', cursor: 'pointer', transform: 'scale(1.2)' }}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {formData.link_type === 'brand' && (
                                <div className={styles.formGroup}>
                                    <label>Select Brand(s) to Route To</label>
                                    <input 
                                        type="text" 
                                        placeholder="Search brands..." 
                                        value={targetSearch} 
                                        onChange={e => setTargetSearch(e.target.value)}
                                        style={{ width: '100%', marginBottom: '10px', padding: '8px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                                    />
                                    <div style={{ maxHeight: '250px', overflowX: 'hidden', overflowY: 'auto', background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {brands.filter(b => b.name?.toLowerCase().includes(targetSearch.toLowerCase())).map(b => (
                                            <label key={b.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', width: '100%', padding: '12px 16px', cursor: 'pointer', background: formData.link_target_brands.includes(b.id) ? 'rgba(197, 163, 92, 0.2)' : 'transparent', borderBottom: '1px solid #444', fontSize: '0.9rem' }}>
                                                <span style={{ textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{b.name}</span>
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.link_target_brands.includes(b.id)} 
                                                    onChange={() => toggleArrayItem('link_target_brands', b.id)}
                                                    style={{ justifySelf: 'end', cursor: 'pointer', transform: 'scale(1.2)' }}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {formData.link_type === 'gift' && (
                                <div className={styles.formGroup}>
                                    <label>Target URL will be routed to /shop?category=accessory</label>
                                    <p style={{color: '#888', fontSize: '0.85rem'}}>Select the custom URL option if you want to link to a very specific page. Gifts usually map to the accessories tab.</p>
                                </div>
                            )}

                            {formData.link_type === 'custom' && (
                                <div className={styles.formGroup}>
                                    <label>Custom Relative URL (e.g. /shop?type=sampler)</label>
                                    <input type="text" className={styles.input} value={formData.custom_url} onChange={e => setFormData({...formData, custom_url: e.target.value})} />
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
                                Active (Show on Homepage)
                            </label>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={resetForm} className="btn-outline">Clear</button>
                                <button type="submit" className="btn" style={{ background: 'var(--color-accent)', color: '#111', fontWeight: 'bold', border: 'none' }}>
                                    {editingPromo ? 'Update Promotion' : 'Add Promotion'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* List Existing */}
                {loading ? <p>Loading existing promotions...</p> : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>ID / Position</th>
                                    <th>Link Targets</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promotions.length === 0 ? <tr><td colSpan="5">No promotions found.</td></tr> : promotions.map(promo => {
                                    const meta = promo.metadata || {};
                                    return (
                                        <tr key={promo.id}>
                                            <td>
                                                <img src={meta.image} alt={promo.value} style={{ width: '80px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                            </td>
                                            <td>
                                                <strong>{promo.value}</strong><br/>
                                                <span style={{ fontSize: '0.8rem', color: '#888' }}>{meta.position}</span>
                                            </td>
                                            <td>
                                                <span style={{ textTransform: 'capitalize', color: 'var(--color-accent)', fontSize: '0.8rem' }}>{meta.link_type} Target</span><br/>
                                                {meta.link_type === 'product' && `${meta.link_target_products?.length || 0} Products`}
                                                {meta.link_type === 'brand' && `${meta.link_target_brands?.length || 0} Brands`}
                                                {meta.link_type === 'custom' && meta.custom_url}
                                            </td>
                                            <td>
                                                {meta.active !== false ? <span style={{color: 'green'}}>Active</span> : <span style={{color: 'red'}}>Hidden</span>}
                                            </td>
                                            <td>
                                                <button onClick={() => editPromo(promo)} style={{ background: 'transparent', color: '#ccc', border: '1px solid #444', marginRight: '5px', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                                                <button onClick={() => handleDelete(promo.id, promo.value)} style={{ background: 'transparent', color: 'red', border: '1px solid red', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Del</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
