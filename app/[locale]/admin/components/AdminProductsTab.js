
import React from 'react';
import styles from '../admin.module.css';
import { Eye, EyeOff, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminProductsTab({
    t, user, products, refreshProducts, toggleProductVisibilityOptimistically,
    adminSearch, setAdminSearch, adminFilterType, setAdminFilterType,
    adminFilterBrand, setAdminFilterBrand, adminFilterStock, setAdminFilterStock,
    adminFilterSize, setAdminFilterSize, persistentAttributes,
    formData, setFormData, currentModel, setCurrentModel,
    editModelIndex, setEditModelIndex, resetForm, status, setStatus,
    parsingDesc, setParsingDesc, uploadingImage, setUploadingImage,
    draggedImageIndex, handleImageDragStart, handleImageDragOver, handleImageDrop,
    previewImage, setPreviewImage,
    handleAddFlavor, handleInputChange, handleModelChange, handleNameBlur,
    handleGenerateId, handleLoadProduct, handleImageUpload, handleAddImageUrl,
    handleRemoveImage, handleSetMainImage, handleDescriptionUpload, handleSubmitProduct,
    handleSaveGiftOption, handleGiftImageUpload

}) {
    const handleBroadcastCollection = async () => {
        const confirmMsg = "Are you sure you want to broadcast this collection to all users on Telegram?\n\nThis will send a single message with the collection image and inline buttons for each item.";
        if (!confirm(confirmMsg)) return;

        setStatus({ loading: true, error: '', success: '' });
        try {
            const res = await fetch('/api/admin/broadcast-collection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: formData.models.map(m => ({
                        name: `${formData.name} ${m.name}`.trim(),
                        size: m.size,
                        price: m.price,
                        id: formData.id // Use product ID, bot will ask for variant
                    })),
                    title: formData.name,
                    description: formData.description,
                    imageUrl: formData.images?.[0] || formData.image
                })
            });

            const json = await res.json();
            if (!json.success) throw new Error(json.error || 'Broadcast failed');

            alert('Broadcast sent successfully! ' + (json.message || ''));
            setStatus({ loading: false, error: '', success: 'Broadcast sent!' });
        } catch (err) {
            console.error('Broadcast error:', err);
            setStatus({ loading: false, error: 'Broadcast Failed: ' + err.message, success: '' });
            alert('Broadcast Failed: ' + err.message);
        }
    };

    return (
                <div className={styles.content}>
                    <div className={styles.form} style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div className={styles.fullWidth} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0 }}>{t('add_edit_product')}</h2>
                            <button 
                                type="button" 
                                onClick={handleBroadcastCollection} 
                                className={styles.btn} 
                                style={{ background: 'linear-gradient(135deg, #1e90ff, #00bfff)', color: '#fff' }}
                            >
                                📢 Broadcast Collection
                            </button>
                        </div>

                        {/* ID Section with Load Feature */}
                        <div className={styles.formGroup} style={{ position: 'relative' }}>
                            <label>Product ID (Slug) - Enter to Load Existing</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    name="id"
                                    value={formData.id}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="e.g. cohiba-behike-52"
                                />
                                <button
                                    type="button"
                                    onClick={handleLoadProduct}
                                    style={{
                                        background: 'var(--color-accent)',
                                        color: '#000',
                                        border: 'none',
                                        padding: '0 1rem',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        display: 'flex', alignItems: 'center', gap: '5px'
                                    }}
                                >
                                    <Search size={16} /> Load
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Product Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={handleNameBlur}
                                className={styles.input}
                                placeholder="Product Name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Type</label>
                            <select name="type" value={formData.type} onChange={handleInputChange} className={styles.select}>
                                <option value="cigar">Cigar</option>
                                <option value="cigarillo">Cigarillo</option>
                                <option value="accessory">Accessory</option>
                                <option value="sampler">Sampler</option>
                                <option value="bundle">Bundle</option>
                            </select>
                        </div>

                        <CreatableSelect
                            label="Brand"
                            name="brand_id"
                            value={formData.brand_id}
                            options={filteredBrands.map(b => ({ value: b.id, label: b.name }))}
                            onChange={handleInputChange}
                        />

                        <CreatableSelect
                            label="Series / Collection"
                            name="series"
                            value={formData.series}
                            options={filteredSeries.map(s => ({ value: s, label: s }))}
                            onChange={handleInputChange}
                            placeholder="Enter Series (Optional)"
                            category="series"
                        />

                        {formData.type === 'sampler' && (
                            <div className={styles.formGroup}>
                                <label style={{ color: '#d4af37' }}>Series Included (Comma Separated)</label>
                                <input
                                    name="sampler_series"
                                    value={formData.sampler_series || ''}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="e.g. Serie D, Behike"
                                />
                            </div>
                        )}

                        <CreatableSelect
                            label="Origin"
                            name="origin"
                            value={formData.origin}
                            options={dynamicOptions.allOrigins.map(o => ({ value: o, label: o }))}
                            onChange={handleInputChange}
                            placeholder="Enter Origin"
                        />

                        <div className={styles.formGroup}>
                            <label>Strength</label>
                            <select name="strength" value={formData.strength || ''} onChange={handleInputChange} className={styles.select}>
                                <option value="">Select Strength</option>
                                <option value="Mild">Mild</option>
                                <option value="Mild to Medium">Mild to Medium</option>
                                <option value="Medium">Medium</option>
                                <option value="Medium to Full">Medium to Full</option>
                                <option value="Full">Full</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Cigar Aficionado (0-100 Points)</label>
                            <input
                                type="text"
                                name="rating"
                                value={formData.rating || ''}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="e.g. 96 Points - Cigar Snob"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Product Badges (e.g., Best Seller, Limited Edition)</label>
                            
                            {/* Smart Toggles */}
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff', fontSize: '0.9rem' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={(formData.badges || []).some(b => typeof b === 'string' && b.toLowerCase().replace(/\s+/g, '') === 'freeshipping')}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setFormData(prev => {
                                                let newBadges = (prev.badges || []).filter(b => typeof b !== 'string' || b.toLowerCase().replace(/\s+/g, '') !== 'freeshipping');
                                                if (isChecked) {
                                                    newBadges.push('Free Shipping');
                                                }
                                                return { ...prev, badges: newBadges };
                                            });
                                        }}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    🚀 Enable Free Shipping
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    id="badgeInput"
                                    className={styles.input}
                                    placeholder="Type a custom badge and click Add"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = e.target.value.trim();
                                            if (val && !(formData.badges || []).includes(val)) {
                                                setFormData(prev => ({ ...prev, badges: [...(prev.badges || []), val] }));
                                                e.target.value = '';
                                            }
                                        }
                                    }}
                                />
                                <button type="button" className="btn" onClick={() => {
                                    const input = document.getElementById('badgeInput');
                                    const val = input.value.trim();
                                    if (val && !(formData.badges || []).includes(val)) {
                                        setFormData(prev => ({ ...prev, badges: [...(prev.badges || []), val] }));
                                        input.value = '';
                                    }
                                }} style={{ padding: '0 20px' }}>Add</button>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {(formData.badges || []).map((badge, idx) => (
                                    <span key={idx} style={{ background: 'var(--color-accent)', color: '#000', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {badge}
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, badges: prev.badges.filter((_, i) => i !== idx) }))} style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Product Images (First image is Main)</label>

                            {/* Upload & Add URL Buttons */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div className={styles.fileUploadWrapper}>
                                    <span className={styles.fileUploadLabel}>[ 📁 UPLOAD IMAGES ]</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className={styles.hiddenFileInput}
                                        title="+ Upload Images"
                                    />
                                </div>
                                <button type="button" onClick={handleAddImageUrl} style={{ background: 'none', border: '1px solid #555', color: '#fff', borderRadius: '4px', cursor: 'pointer', padding: '5px 10px' }}>
                                    + Add URL
                                </button>
                                {uploadingImage && <span style={{ marginLeft: '1rem', color: 'var(--color-accent)' }}>Uploading...</span>}
                            </div>

                            {/* Image Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                                {(formData.images || []).map((img, idx) => (
                                    <div key={idx} draggable onDragStart={() => handleImageDragStart(idx)} onDragOver={handleImageDragOver} onDrop={() => handleImageDrop(idx)} style={{ position: 'relative', border: formData.image === img ? '2px solid var(--color-accent)' : '1px solid #333', borderRadius: '4px', overflow: 'hidden', aspectRatio: '1/1', background: '#000', cursor: 'grab' }}>
                                        <img src={img} alt={`Img ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }} onClick={() => setPreviewImage(img)} />
                                        
                                        {/* Delete Badge */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newImages = [...formData.images];
                                                newImages.splice(idx, 1);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    images: newImages,
                                                    image: prev.image === img ? newImages[0] || '' : prev.image
                                                }));
                                            }}
                                            style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: 'red', border: 'none', cursor: 'pointer', padding: '2px 5px', fontSize: '0.8rem' }}
                                        >
                                            X
                                        </button>

                                        {/* Bottom Action Bar */}
                                        <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 4px', boxSizing: 'border-box' }}>
                                            {/* Reorder Left */}
                                            {idx > 0 && (
                                                <button type="button" onClick={(e) => { e.stopPropagation(); moveImage(idx, 'left'); }} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                    &lt;
                                                </button>
                                            )}

                                            {/* Set Cover Toggle */}
                                            {formData.image !== img ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleSetMainImage(img); }}
                                                    style={{ color: '#aaa', background: 'none', border: 'none', fontSize: '0.7rem', cursor: 'pointer' }}
                                                >
                                                    Set Cover
                                                </button>
                                            ) : (
                                                <span style={{ color: 'var(--color-accent)', fontSize: '0.7rem', fontWeight: 'bold' }}>Cover</span>
                                            )}

                                            {/* Reorder Right */}
                                            {idx < (formData.images || []).length - 1 && (
                                                <button type="button" onClick={(e) => { e.stopPropagation(); moveImage(idx, 'right'); }} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                    &gt;
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image Preview Modal */}
                        {previewImage && (
                            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPreviewImage(null)}>
                                <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                                    <img src={previewImage} style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} />
                                    <button
                                        onClick={() => setPreviewImage(null)}
                                        style={{ position: 'absolute', top: '-15px', right: '-15px', background: 'white', color: 'black', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        X
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={styles.formGroup} style={{ border: '1px solid #333', padding: '1rem', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    name="has_gifts"
                                    id="has_gifts"
                                    checked={formData.has_gifts || false}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setFormData(prev => ({
                                            ...prev,
                                            has_gifts: checked,
                                            available_gifts: checked ? (prev.available_gifts || []) : []
                                        }));
                                    }}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                                <label htmlFor="has_gifts" style={{ cursor: 'pointer', margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Include Gift Packaging Options</label>
                            </div>

                            {formData.has_gifts && persistentAttributes.gift_option?.length > 0 && (
                                <div style={{ marginTop: '15px', paddingLeft: '30px' }}>
                                    <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '8px' }}>
                                        Select which gifts to display for this Product. (Unselected gifts will be completely hidden from the storefront)
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {persistentAttributes.gift_option.map(giftName => (
                                            <label key={`prod-${giftName}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: '#111', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', border: '1px solid #444', transition: 'all 0.2s', ...(formData.available_gifts?.includes(giftName) ? { borderColor: 'var(--color-accent)', background: 'rgba(232, 211, 162, 0.1)' } : {}) }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.available_gifts?.includes(giftName) || false}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setFormData(prev => {
                                                            const current = prev.available_gifts || [];
                                                            if (checked) return { ...prev, available_gifts: [...current, giftName] };
                                                            return { ...prev, available_gifts: current.filter(g => g !== giftName) };
                                                        });
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                {giftName}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {formData.type === 'accessory' && (
                            <CreatableSelect
                                label="Category"
                                name="category"
                                value={formData.category}
                                options={[
                                    { value: 'lighter', label: 'Lighter' },
                                    { value: 'cutter', label: 'Cutter' },
                                    { value: 'humidor', label: 'Humidor' },
                                    { value: 'ashtray', label: 'Ashtray' }
                                ]}
                                onChange={handleInputChange}
                            />
                        )}

                        <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ border: '1px solid #333', padding: '1rem', borderRadius: '4px' }}>
                            <label style={{ marginBottom: '1rem', display: 'block' }}>Pricing Options / Models</label>

                            {/* List of Added Models */}
                            {formData.models.length > 0 && (
                                <ul style={{ marginBottom: '1rem', padding: 0, listStyle: 'none' }}>
                                    {formData.models.map((m, idx) => (
                                        <li key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', background: '#222', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px', alignItems: 'center' }}>
                                            <span>
                                                <strong>{m.name}</strong>
                                                <br />
                                                <span style={{ fontSize: '0.85em', color: '#aaa' }}>{m.size} {m.dimensions ? `(${m.dimensions})` : ''}</span>
                                            </span>
                                            <span style={{ textAlign: 'right' }}>
                                                {m.original_price ? (
                                                    <span style={{ textDecoration: 'line-through', color: '#888', marginRight: '8px', fontSize: '0.9em' }}>EGP {m.original_price}</span>
                                                ) : null}
                                                EGP {m.price} <br />
                                                <span style={{ fontSize: '0.8em', color: '#888' }}>Stock: {m.stock}</span><br />
                                                {m.disable_gifts ? (
                                                    <span style={{ fontSize: '0.75em', color: '#ff4d4d' }}>Gifts: Disabled</span>
                                                ) : m.allowed_gifts && m.allowed_gifts.length > 0 ? (
                                                    <span style={{ fontSize: '0.75em', color: 'var(--color-accent)' }}>
                                                        Gifts: {m.allowed_gifts.map(g => {
                                                            const over = m.gift_overrides?.[g];
                                                            return over !== undefined && over !== null ? `${g} (${over === 0 ? 'Free' : 'EGP ' + over})` : g;
                                                        }).join(', ')}
                                                    </span>
                                                ) : formData.has_gifts ? (
                                                    <span style={{ fontSize: '0.75em', color: '#666' }}>Gifts: All</span>
                                                ) : null}
                                            </span>
                                            <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                                                <button type="button" onClick={() => { setCurrentModel(formData.models[idx]); setEditModelIndex(idx); }} style={{ color: 'var(--color-accent)', background: 'none', border: '1px solid var(--color-accent)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                                                <button type="button" onClick={() => removeModel(idx)} style={{ color: '#ff4d4d', background: 'none', border: '1px solid #ff4d4d', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>X</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', alignItems: 'end', marginBottom: '1rem' }}>
                                <div>
                                    <CreatableSelect
                                        label="Variant (e.g. Single)"
                                        name="name"
                                        value={currentModel.name}
                                        options={dynamicOptions.allVariants.map(v => ({ value: v, label: v }))}
                                        onChange={handleModelChange}
                                        placeholder="Variant"
                                    />
                                </div>
                                <div>
                                    <CreatableSelect
                                        label="Format/Size"
                                        name="size"
                                        value={currentModel.size}
                                        options={dynamicOptions.allSizes.map(s => ({ value: s, label: s }))}
                                        onChange={handleModelChange}
                                        placeholder="Format"
                                    />
                                </div>
                                <div>
                                    <CreatableSelect
                                        label="Dims (e.g 6x60)"
                                        name="dimensions"
                                        value={currentModel.dimensions}
                                        options={dynamicOptions.allDimensions.map(d => ({ value: d, label: d }))}
                                        onChange={handleModelChange}
                                        placeholder="6x60"
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr auto', gap: '0.5rem', alignItems: 'end' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#888' }}>Orig. Price (EGP)</label>
                                    <input
                                        name="original_price"
                                        type="number"
                                        value={currentModel.original_price}
                                        onChange={handleModelChange}
                                        placeholder="0"
                                        className={styles.input}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#888' }}>Price (EGP)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        value={currentModel.price}
                                        onChange={handleModelChange}
                                        placeholder="0"
                                        className={styles.input}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#888' }}>Stock</label>
                                    <input
                                        name="stock"
                                        type="number"
                                        value={currentModel.stock}
                                        onChange={handleModelChange}
                                        placeholder="10"
                                        className={styles.input}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#888' }}>Link Specific Image (Optional)</label>
                                    <select
                                        name="image"
                                        value={currentModel.image}
                                        onChange={handleModelChange}
                                        className={styles.input}
                                        style={{ color: currentModel.image ? '#fff' : '#666' }}
                                    >
                                        <option value="">-- No specific image --</option>
                                        {(formData.images || []).map((img, i) => (
                                            <option key={i} value={img}>Image {i + 1} ({img.split('/').pop().substring(0, 15)}...)</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ alignSelf: 'flex-end', marginBottom: '4px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <button type="button" onClick={addModel} style={{ background: 'var(--color-accent)', color: '#000', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        {editModelIndex !== null ? 'Update Variant' : 'Add Variant'}
                                    </button>
                                    {editModelIndex !== null && (
                                        <button type="button" onClick={() => { setEditModelIndex(null); setCurrentModel({ name: '', size: '', dimensions: '', price: '', stock: '', image: '', allowed_gifts: [], gift_overrides: {}, disable_gifts: false }); }} style={{ background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '0.4rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            {formData.has_gifts && persistentAttributes.gift_option?.length > 0 && (
                                <div style={{ marginTop: '1rem', padding: '15px', background: '#111', borderRadius: '6px', border: '1px dashed #444' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4d', fontWeight: 'bold', marginBottom: '10px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={currentModel.disable_gifts || false}
                                            onChange={(e) => setCurrentModel(prev => ({ ...prev, disable_gifts: e.target.checked }))}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        Disable Gift Packaging Options for this Variant
                                    </label>

                                    {!currentModel.disable_gifts && (
                                        <>
                                            <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '10px' }}>Allowed Gifts for this Variant (Leave unchecked to allow ALL global gifts)</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
                                                {persistentAttributes.gift_option.map(giftName => (
                                                    <label key={giftName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.9rem', textAlign: 'center', background: '#222', padding: '15px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #444', transition: 'all 0.2s', position: 'relative', ...(currentModel.allowed_gifts?.includes(giftName) ? { borderColor: 'var(--color-accent)', background: 'rgba(232, 211, 162, 0.1)' } : {}) }}>
                                                        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={currentModel.allowed_gifts?.includes(giftName) || false}
                                                                onChange={(e) => {
                                                                    setCurrentModel(prev => {
                                                                        const current = prev.allowed_gifts || [];
                                                                        if (e.target.checked) return { ...prev, allowed_gifts: [...current, giftName] };
                                                                        return { ...prev, allowed_gifts: current.filter(g => g !== giftName) };
                                                                    });
                                                                }}
                                                                style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                                                            />
                                                        </div>
                                                        {attributeMetadata[giftName]?.image && (
                                                            <img 
                                                                src={attributeMetadata[giftName].image} 
                                                                alt={giftName} 
                                                                style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '4px', marginBottom: '5px' }} 
                                                            />
                                                        )}
                                                        <span style={{ fontWeight: 'bold' }}>{giftName}</span>
                                                        {currentModel.allowed_gifts?.includes(giftName) && (
                                                            <input
                                                                type="number"
                                                                placeholder="Discount (EGP)"
                                                                value={currentModel.gift_overrides?.[giftName] ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setCurrentModel(prev => ({
                                                                        ...prev,
                                                                        gift_overrides: {
                                                                            ...(prev.gift_overrides || {}),
                                                                            [giftName]: val === '' ? null : parseFloat(val)
                                                                        }
                                                                    }));
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                                style={{ width: '100%', padding: '6px', fontSize: '0.85rem', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px', marginTop: 'auto', textAlign: 'center' }}
                                                            />
                                                        )}
                                                    </label>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>


                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className={`${styles.textarea}`}
                                rows={5}
                            />
                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                {parsingDesc && <span style={{ color: 'var(--color-accent)' }}>Extracting...</span>}
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>Auto-fill from (PDF/Docx):</span>
                                <div className={styles.fileUploadWrapper}>
                                    <span className={styles.fileUploadLabel}>[ 📄 UPLOAD BROCHURE ]</span>
                                    <input
                                        type="file"
                                        accept=".pdf,.docx"
                                        onChange={handleDescriptionUpload}
                                        className={styles.hiddenFileInput}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label>Flavor Notes (Type & Enter to Add)</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                {(formData.flavor_profile || []).map((flavor, i) => (
                                    <span key={i} style={{ background: 'var(--color-accent)', color: '#000', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {flavor}
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, flavor_profile: prev.flavor_profile.filter(f => f !== flavor) }))}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input
                                    placeholder="Type & Enter to add custom flavor..."
                                    className={styles.input}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddFlavor(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                {/* Predefined Options */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {allFlavorOptions.filter(f => !formData.flavor_profile?.includes(f)).map(flavor => (
                                        <button
                                            key={flavor}
                                            type="button"
                                            onClick={() => handleAddFlavor(flavor)}
                                            style={{
                                                padding: '0.3rem 0.8rem',
                                                borderRadius: '15px',
                                                border: '1px solid #555',
                                                background: 'transparent',
                                                color: '#aaa',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => e.target.style.borderColor = '#fff'}
                                            onMouseOut={(e) => e.target.style.borderColor = '#555'}
                                        >
                                            + {flavor}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.fullWidth}>
                            {status.error && <p style={{ color: 'red', marginBottom: '1rem' }}>{status.error}</p>}
                            {status.success && <p style={{ color: 'green', marginBottom: '1rem' }}>{status.success}</p>}
                            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '2rem' }}>
                                <button
                                    onClick={resetForm}
                                    style={{
                                        background: 'transparent',
                                        color: '#ff4d4d',
                                        border: '1px solid #ff4d4d',
                                        padding: '12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        flex: 1
                                    }}
                                >
                                    Cancel / Clear
                                </button>
                                <button
                                    onClick={handleSubmitProduct}
                                    disabled={status.loading || uploadingImage}
                                    style={{
                                        background: 'var(--color-accent)',
                                        color: '#000',
                                        border: 'none',
                                        padding: '12px',
                                        borderRadius: '4px',
                                        cursor: (status.loading || uploadingImage) ? 'not-allowed' : 'pointer',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        flex: 1
                                    }}
                                >
                                    {status.loading || uploadingImage ? 'Processing...' : 'Save Product'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'nowrap', gap: '0.5rem', width: '100%', overflowX: 'auto', paddingBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                                <h2 style={{ margin: 0, whiteSpace: 'nowrap' }}>Product List ({filteredProductsList.length})</h2>
                                <button
                                    onClick={async () => {
                                        const checked = !autoHideStock;
                                        setAutoHideStock(checked);
                                        try {
                                            const res = await fetch('/api/admin/attributes', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ category: 'setting', value: 'auto_hide_out_of_stock', metadata: { enabled: checked } })
                                            });
                                            if (!res.ok) alert('Failed to save setting');
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: autoHideStock ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
                                        border: `1px solid ${autoHideStock ? '#f44336' : '#333'}`,
                                        color: autoHideStock ? '#f44336' : '#888',
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        transition: 'all 0.2s',
                                        lineHeight: '1.2',
                                        textAlign: 'left'
                                    }}
                                    title={autoHideStock ? 'Out of stock items are currently hidden globally' : 'Out of stock items are currently visible globally'}
                                >
                                    {autoHideStock ? <EyeOff size={16} style={{ flexShrink: 0 }} /> : <Eye size={16} style={{ flexShrink: 0 }} />}
                                    <span style={{ display: 'inline-block' }}>Auto-Hide<br/>Out of Stock</span>
                                </button>
                            </div>

                            {/* Search & Filters */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap', alignItems: 'center', flex: 1, justifyContent: 'flex-end', minWidth: 'min-content' }}>
                                <input
                                    placeholder="Search products..."
                                    value={adminSearch}
                                    onChange={(e) => setAdminSearch(e.target.value)}
                                    className={styles.input}
                                    style={{ padding: '0.5rem', width: '100%', maxWidth: '250px', fontSize: '0.85rem' }}
                                />
                                <select
                                    value={adminFilterType}
                                    onChange={(e) => setAdminFilterType(e.target.value)}
                                    className={styles.select}
                                    style={{ padding: '0.5rem', width: 'auto', flex: '1 1 auto', fontSize: '0.85rem', maxWidth: '150px' }}
                                >
                                    <option value="all">All Types</option>
                                    <option value="cigar">Cigar</option>
                                    <option value="cigarillo">Cigarillo</option>
                                    <option value="accessory">Accessory</option>
                                    <option value="sampler">Sampler</option>
                                    <option value="bundle">Bundle</option>
                                </select>
                                <select
                                    value={adminFilterBrand}
                                    onChange={(e) => setAdminFilterBrand(e.target.value)}
                                    className={styles.select}
                                    style={{ padding: '0.5rem', width: 'auto', flex: '1 1 auto', fontSize: '0.85rem', maxWidth: '160px' }}
                                >
                                    <option value="all">All Brands</option>
                                    {availableBrands.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={adminFilterStock}
                                    onChange={(e) => setAdminFilterStock(e.target.value)}
                                    className={styles.select}
                                    style={{ padding: '0.5rem', width: 'auto', flex: '1 1 auto', fontSize: '0.85rem', maxWidth: '140px' }}
                                >
                                    <option value="all">All Stock</option>
                                    <option value="in_stock">In Stock</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                </select>
                                <select
                                    value={adminFilterSize}
                                    onChange={(e) => setAdminFilterSize(e.target.value)}
                                    className={styles.select}
                                    style={{ padding: '0.5rem', width: 'auto', flex: '1 1 auto', fontSize: '0.85rem', maxWidth: '150px' }}
                                >
                                    <option value="all">All Sizes</option>
                                    {dynamicOptions.allSizes.map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                    {dynamicOptions.allDimensions.map(dim => (
                                        <option key={`dim_${dim}`} value={dim}>{dim}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="max-h-[600px] overflow-y-auto border border-gray-800 rounded-lg custom-scrollbar" style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #1f2937', borderRadius: '0.5rem' }}>
                            <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ position: 'sticky', top: 0, background: '#120C0A', zIndex: 10 }}>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>ID</th>
                                        <th>Brand</th>
                                        <th>Origin</th>
                                        <th>Price</th>
                                        <th>Stock (Variants)</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProductsList.map(p => {
                                        const productStock = p.models?.reduce((acc, m) => acc + parseInt(m.stock || 0), 0) || 0;
                                        const isCurrentlyHidden = p.is_visible === false || (autoHideStock && productStock === 0 && p.is_visible !== null);
                                        return (
                                        <tr key={p.id} style={{ opacity: isCurrentlyHidden ? 0.5 : 1, filter: isCurrentlyHidden ? 'grayscale(100%)' : 'none', transition: 'all 0.3s' }}>
                                            <td>
                                                <img src={p.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                            </td>
                                            <td>{p.name}</td>
                                            <td style={{ fontSize: '0.8em', color: '#888' }}>{p.id}</td>
                                            <td>{BRANDS.find(b => b.id === (p.brandId || p.brand_id))?.name || (p.brandId || p.brand_id)}</td>
                                            <td>{p.origin || 'Imported'}</td>
                                            <td>EGP {p.models?.[0]?.price}</td>
                                            <td style={{ fontSize: '0.85rem' }}>
                                                {p.models && p.models.length > 0 ? p.models.map((m, idx) => (
                                                    <div key={idx} style={{ marginBottom: '4px', whiteSpace: 'nowrap' }}>
                                                        <span style={{ color: '#888' }}>{[m.size, m.name].filter(Boolean).join(' ') || 'Base'}: </span>
                                                        <strong style={{ color: parseInt(m.stock || 0) > 0 ? '#4caf50' : '#f44336' }}>
                                                            {parseInt(m.stock || 0) > 0 ? m.stock : 'Out of Stock'}
                                                        </strong>
                                                    </div>
                                                )) : <span style={{ color: '#666' }}>N/A</span>}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <button
                                                        onClick={async () => {
                                                            // If currently hidden, clicking will force it visible (null). If visible, it forces it hidden (false).
                                                            const newVisible = isCurrentlyHidden ? null : false;
                                                            // Optimistic update
                                                            toggleProductVisibilityOptimistically(p.id, newVisible);
                                                            
                                                            // Async API call in background
                                                            fetch('/api/products/visibility', {
                                                                method: 'PUT',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ id: p.id, is_visible: newVisible, admin_secret: 'admin@129' })
                                                            }).then(async res => {
                                                                if (!res.ok) {
                                                                    const data = await res.json();
                                                                    alert('Failed to update visibility: ' + (data.error || 'Unknown error'));
                                                                    // Revert if explicitly failed
                                                                    toggleProductVisibilityOptimistically(p.id, p.is_visible);
                                                                }
                                                            }).catch(err => {
                                                                alert('Error updating visibility: ' + err.message);
                                                                // Revert on network error
                                                                toggleProductVisibilityOptimistically(p.id, p.is_visible);
                                                            });
                                                        }}
                                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '4px' }}
                                                        title={isCurrentlyHidden ? 'Force Show on Storefront' : 'Hide from Storefront'}
                                                    >
                                                        {isCurrentlyHidden ? <EyeOff size={20} color="#f44336" /> : <Eye size={20} color="#4caf50" />}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setFormData({
                                                                id: p.id,
                                                                name: p.name,
                                                                brand_id: p.brandId || p.brand_id,
                                                                type: p.type,
                                                                origin: p.origin || BRANDS.find(b => b.id === p.brand_id)?.origin || 'Imported',
                                                                category: p.category || '',
                                                                description: p.description || '',
                                                                image: p.image || '',
                                                                images: Array.from(new Set([p.image, ...(p.images || [])])).filter(Boolean),
                                                                strength: p.strength || 'Medium',
                                                                rating: p.rating || '',
                                                                flavor_profile: p.flavor_profile || [],
                                                                models: p.models || []
                                                            });
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            setStatus({ loading: false, error: '', success: 'Product loaded for editing!' });
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: '1px solid #007bff',
                                                            color: '#007bff',
                                                            padding: '0.3rem 0.6rem',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => { e.target.style.background = '#007bff'; e.target.style.color = '#fff'; }}
                                                        onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#007bff'; }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm('Are you sure you want to delete this product?')) return;
                                                            try {
                                                                const res = await fetch(`/api/products?id=${p.id}&admin_secret=admin@129`, { method: 'DELETE' });
                                                                const data = await res.json(); // Get error message if any
                                                                if (res.ok) {
                                                                    await refreshProducts();
                                                                } else {
                                                                    alert('Delete Failed: ' + (data.error || 'Unknown error'));
                                                                }
                                                            } catch (err) {
                                                                alert('Delete Error: ' + err.message);
                                                            }
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: '1px solid #dc3545',
                                                            color: '#dc3545',
                                                            padding: '0.3rem 0.6rem',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => { e.target.style.background = '#dc3545'; e.target.style.color = '#fff'; }}
                                                        onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#dc3545'; }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            
    );
}
