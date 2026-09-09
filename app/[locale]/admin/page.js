'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/lib/navigation';
import styles from './admin.module.css';
import { useProducts } from '@/context/ProductContext';
import { BRANDS } from '@/lib/data';
import { supabase } from '@/lib/supabaseClient';
import { Search, Eye, EyeOff } from 'lucide-react';
import AdminPromotions from './AdminPromotions';
import AdminManualOrder from './AdminManualOrder';
import AdminMarketing from './AdminMarketing';
import AdminPromoCodes from './AdminPromoCodes';
import AdminOrdersTab from './components/AdminOrdersTab';
import AdminUsersTab from './components/AdminUsersTab';
import AdminAttributesTab from './components/AdminAttributesTab';
import AdminProductsTab from './components/AdminProductsTab';
import { useTranslations } from 'next-intl';

export default function AdminPage() {
    const t = useTranslations('Admin');
    const { user, loading: authLoading } = useAuth();
    const { products, refreshProducts, autoHideStock: globalAutoHide, toggleProductVisibilityOptimistically } = useProducts();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('products'); // products | orders | users
    const [adminUsers, setAdminUsers] = useState([]);
    const [checkoutCustomerSearch, setCheckoutCustomerSearch] = useState('');

    const defaultTabs = [
        { id: 'products', labelKey: 'tabs_products' },
        { id: 'orders', labelKey: 'tabs_orders' },
        { id: 'attributes', labelKey: 'tabs_attributes' },
        { id: 'users', labelKey: 'tabs_users' },
        { id: 'promotions', labelKey: 'tabs_promotions' },
        { id: 'promos', labelKey: 'tabs_promos' },
        { id: 'marketing', labelKey: 'tabs_marketing' }
    ];

    const [adminTabsOrder, setAdminTabsOrder] = useState(defaultTabs);
    const [draggedTabIndex, setDraggedTabIndex] = useState(null);

    useEffect(() => {
        const savedTabs = localStorage.getItem('admin_tabs_order');
        if (savedTabs) {
            try {
                const parsed = JSON.parse(savedTabs);
                if (Array.isArray(parsed) && parsed.length === defaultTabs.length) {
                    // Make sure the structure is correct
                    const isValid = parsed.every(pt => defaultTabs.some(dt => dt.id === pt.id));
                    if (isValid) setAdminTabsOrder(parsed);
                }
            } catch(e) {}
        }
    }, []);

    const handleDragStart = (e, index) => {
        setDraggedTabIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            if (e.target) e.target.style.opacity = '0.4';
        }, 0);
    };

    const handleDragEnter = (e, index) => {
        e.preventDefault();
        if (draggedTabIndex === null || draggedTabIndex === index) return;
        const newTabs = [...adminTabsOrder];
        const draggedItem = newTabs[draggedTabIndex];
        newTabs.splice(draggedTabIndex, 1);
        newTabs.splice(index, 0, draggedItem);
        setDraggedTabIndex(index);
        setAdminTabsOrder(newTabs);
    };

    const handleDragEnd = (e) => {
        if (e.target) e.target.style.opacity = '1';
        setDraggedTabIndex(null);
        localStorage.setItem('admin_tabs_order', JSON.stringify(adminTabsOrder));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const [persistentAttributes, setPersistentAttributes] = useState({
        brand: [],
        origin: [],
        size: [],
        variant: [],
        dimension: [],
        category: [],
        flavor: [],
        gift_option: [],
        series: []
    });
    const [hiddenAttributes, setHiddenAttributes] = useState({
        brand: [], origin: [], size: [], variant: [], dimension: [], category: [], flavor: [], gift_option: [], series: []
    });
    const [attributeMetadata, setAttributeMetadata] = useState({}); // { 'BrandName': { type: 'cigar' } }

    const [newAttributeForm, setNewAttributeForm] = useState({ category: 'brand', value: '' });

    // Admin Product Filter State
    const [adminSearch, setAdminSearch] = useState('');
    const [adminFilterType, setAdminFilterType] = useState('all');
    const [adminFilterBrand, setAdminFilterBrand] = useState('all');
    const [adminFilterStock, setAdminFilterStock] = useState('all');
    const [adminFilterSize, setAdminFilterSize] = useState('all');

    // Global Settings State
    const [autoHideStock, setAutoHideStock] = useState(false);

    useEffect(() => {
        setAutoHideStock(globalAutoHide);
    }, [globalAutoHide]);


    // Fetch Attributes on Mount
    useEffect(() => {
        const fetchAttributes = async () => {
            try {
                const res = await fetch('/api/admin/attributes');
                const json = await res.json();
                if (json.success) {
                    const grouped = {
                        brand: [], origin: [], size: [], variant: [], dimension: [], category: [], flavor: [], gift_option: [], series: []
                    };
                    const hidden = {
                        brand: [], origin: [], size: [], variant: [], dimension: [], category: [], flavor: [], gift_option: [], series: []
                    };
                    const meta = {};
                    json.data.forEach(attr => {
                        if (attr.metadata?.hidden) {
                            if (!hidden[attr.category]) hidden[attr.category] = [];
                            hidden[attr.category].push(attr.value);
                        } else {
                            if (!grouped[attr.category]) grouped[attr.category] = [];
                            grouped[attr.category].push(attr.value);
                            if (attr.metadata || attr.id) {
                                meta[attr.value] = { ...(attr.metadata || {}), id: attr.id };
                            }
                        }
                    });
                    setPersistentAttributes(grouped);
                    setHiddenAttributes(hidden);
                    setAttributeMetadata(meta);

                    // Load global setting if exists
                    if (grouped.setting && grouped.setting.includes('auto_hide_out_of_stock')) {
                        setAutoHideStock(meta['auto_hide_out_of_stock']?.enabled === true);
                    }
                }
            } catch (err) {
                console.error('Failed to load attributes', err);
            }
        };
        fetchAttributes();

        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/admin/orders');
                const json = await res.json();
                if (json.success) {
                    setAdminOrders(json.orders || []);
                }
            } catch (err) {
                console.error('Failed to load admin orders', err);
            }
        };
        fetchOrders();

        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users');
                const json = await res.json();
                if (json.success) {
                    setAdminUsers(json.users || []);
                }
            } catch (err) { }
        };
        fetchUsers();
    }, []);

    // Form State
    const [adminOrders, setAdminOrders] = useState([]);
    const [orderSearch, setOrderSearch] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('All');
    const [orderDateFilter, setOrderDateFilter] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [confirmingOrder, setConfirmingOrder] = useState(null);
    const initialFormState = {
        id: '',
        name: '',
        brand_id: 'cohiba',
        type: 'cigar',
        origin: BRANDS.length > 0 ? BRANDS[0].origin : '',
        description: '',
        image: '',
        images: [], // Multiple images
        strength: 'Medium',
        rating: '',
        flavor_profile: [],
        models: [], // Array of { name, size, dimensions, price }
        category: '',
        series: '',
        sampler_series: '',
        has_gifts: false
    };

    const initialModelState = { name: '', size: '', dimensions: '', price: '', original_price: '', stock: '', allowed_gifts: [], gift_overrides: {}, disable_gifts: false };

    const [formData, setFormData] = useState(initialFormState);

    // ... (rest of state items are fine) ...
    const [currentModel, setCurrentModel] = useState(initialModelState);
    const [editModelIndex, setEditModelIndex] = useState(null);

    const resetForm = () => {
        setFormData(initialFormState);
        setCurrentModel(initialModelState);
        setEditModelIndex(null);
        setStatus({ loading: false, error: '', success: '' });
    };
    // const [imageFile, setImageFile] = useState(null); // Deprecated in favor of direct upload
    
    const [draggedImageIndex, setDraggedImageIndex] = useState(null);

    const handleImageDragStart = (idx) => {
        setDraggedImageIndex(idx);
    };

    const handleImageDragOver = (e) => {
        e.preventDefault();
    };

    const handleImageDrop = (idx) => {
        if (draggedImageIndex === null || draggedImageIndex === idx) return;
        setFormData(prev => {
            const newImages = [...prev.images];
            const dragged = newImages[draggedImageIndex];
            newImages.splice(draggedImageIndex, 1);
            newImages.splice(idx, 0, dragged);
            return { ...prev, images: newImages };
        });
        setDraggedImageIndex(null);
    };

    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewImage, setPreviewImage] = useState(null); // For modal preview
    const [parsingDesc, setParsingDesc] = useState(false);
    const [status, setStatus] = useState({ loading: false, error: '', success: '' });

    const FLAVOR_OPTIONS = [
        'Woody', 'Spicy', 'Earthy', 'Leather', 'Coffee', 'Cocoa',
        'Nutty', 'Creamy', 'Sweet', 'Pepper', 'Cedar', 'Vanilla', 'Floral'
    ];

    const allFlavorOptions = useMemo(() => {
        const unique = new Set([...FLAVOR_OPTIONS, ...(persistentAttributes.flavor || [])]);
        return [...unique].sort();
    }, [persistentAttributes.flavor]);

    const handleAddFlavor = async (val) => {
        if (!val) return;
        const normalized = val.trim();
        // Add to local form state
        if (!formData.flavor_profile?.includes(normalized)) {
            setFormData(prev => ({
                ...prev,
                flavor_profile: [...(prev.flavor_profile || []), normalized]
            }));

            // Persist if not in predefined or existing persistent list
            if (!FLAVOR_OPTIONS.includes(normalized) && !persistentAttributes.flavor?.includes(normalized)) {
                try {
                    await fetch('/api/admin/attributes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ category: 'flavor', value: normalized })
                    });
                    // Optimistically update persistent attributes
                    setPersistentAttributes(prev => ({
                        ...prev,
                        flavor: [...(prev.flavor || []), normalized].sort()
                    }));
                } catch (e) {
                    console.error('Failed to persist flavor', e);
                }
            }
        }
    };

    // Gift Option Form State
    const [giftOptionForm, setGiftOptionForm] = useState({ name: '', price: '', description: '', image: '' });
    const [uploadingGiftImage, setUploadingGiftImage] = useState(false);
    const [editingGiftId, setEditingGiftId] = useState(null);
    const [editingGiftOldName, setEditingGiftOldName] = useState(null);
    // Editing Brand Modal State
    const [editingBrand, setEditingBrand] = useState(null); // { category: 'brand', oldVal, value, image, isPersistent, id }

    const handleGiftImageUpload = async (e) => {
        let file = e.target.files?.[0];
        if (!file) return;

        setUploadingGiftImage(true);
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            setUploadingGiftImage(false);
            return;
        }
        
        const fb = new FormData();
        fb.append('file', file);
        try {
            const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fb });
            const data = await res.json();
            if (data.url) {
                setGiftOptionForm(prev => ({ ...prev, image: data.url }));
            }
        } catch (e) {
            alert('Upload failed: ' + e.message);
        }
        setUploadingGiftImage(false);
    };
const handleSaveGiftOption = async () => {
        if (!giftOptionForm.name || !giftOptionForm.price || !giftOptionForm.image) {
            alert('Name, Price, and Image are required for a Gift Option.');
            return;
        }

        try {
            const method = editingGiftId ? 'PUT' : 'POST';
            const payload = {
                category: 'gift_option',
                value: giftOptionForm.name,
                metadata: {
                    price: parseFloat(giftOptionForm.price) || 0,
                    description: giftOptionForm.description,
                    image: giftOptionForm.image,
                    is_manual: true
                }
            };
            if (editingGiftId) payload.id = editingGiftId;

            const res = await fetch('/api/admin/attributes', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();

            if (json.success) {
                // Optimistically update
                setPersistentAttributes(prev => {
                    let existing = prev.gift_option || [];
                    if (editingGiftId && editingGiftOldName && editingGiftOldName !== giftOptionForm.name) {
                        existing = existing.filter(g => g !== editingGiftOldName);
                    }
                    if (!existing.includes(giftOptionForm.name)) {
                        return { ...prev, gift_option: [...existing, giftOptionForm.name] };
                    }
                    return prev;
                });
                setAttributeMetadata(prev => {
                    const newMeta = { ...prev };
                    if (editingGiftId && editingGiftOldName && editingGiftOldName !== giftOptionForm.name) {
                        delete newMeta[editingGiftOldName];
                    }
                    newMeta[giftOptionForm.name] = {
                        ...payload.metadata,
                        id: json.data?.id || editingGiftId
                    };
                    return newMeta;
                });
                // Reset form
                setGiftOptionForm({ name: '', price: '', description: '', image: '' });
                setEditingGiftId(null);
                setEditingGiftOldName(null);
                alert(editingGiftId ? 'Gift option updated successfully!' : 'Gift option added successfully!');
            } else {
                alert(`Failed to ${editingGiftId ? 'update' : 'add'} gift option: ` + json.error);
            }
        } catch (error) {
            alert('Failed to connect to server.');
        }
    };

    const handleConfirmOrder = async (orderId) => {
        if (!confirm('Are you sure you want to confirm this order and send an email to the customer?')) return;
        setConfirmingOrder(orderId);
        try {
            const res = await fetch('/api/admin/orders/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, processedBy: user?.email?.split('@')[0] || 'admin' })
            });
            const data = await res.json();
            if (data.success) {
                alert('Order confirmed and email sent!');
                const timestamp = new Date().toISOString();
                const processor = user?.email?.split('@')[0] || 'admin';
                setAdminOrders(adminOrders.map(o => o.id === orderId ? { 
                    ...o, 
                    status: 'Confirmed',
                    confirmed_at: timestamp,
                    updated_at: timestamp,
                    processed_by: processor
                } : o));
            } else {
                alert('Failed to confirm order: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            alert('Error confirming order: ' + e.message);
        } finally {
            setConfirmingOrder(null);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!confirm('Are you sure you want to cancel this order? This will revert the stock for all items.')) return;
        setConfirmingOrder(orderId); // reuse loading state
        try {
            const res = await fetch('/api/admin/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, processedBy: user?.email?.split('@')[0] || 'admin' })
            });
            const data = await res.json();
            if (data.success) {
                alert('Order cancelled and stock reverted successfully!');
                const timestamp = new Date().toISOString();
                const processor = user?.email?.split('@')[0] || 'admin';
                setAdminOrders(adminOrders.map(o => o.id === orderId ? { 
                    ...o, 
                    status: 'cancelled',
                    cancelled_at: timestamp,
                    updated_at: timestamp,
                    processed_by: processor
                } : o));
            } else {
                alert('Failed to cancel order: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            alert('Error cancelling order: ' + e.message);
        } finally {
            setConfirmingOrder(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const DIM_MAP = {
        'robust': '5 x 50', 'Robusto': '5 x 50', 'Toro': '6 x 52', 'Churchill': '7 x 48', 'Gordo': '6 x 60', 'Gordito': '5.5 x 60',
        'Double Toro': '6 x 60', 'Perfecto': '6 x 54', 'Torpedo': '6.1 x 52', 'Belicoso': '5.5 x 52',
        'Corona': '5.5 x 42', 'Petit Robusto': '4.5 x 50', 'Double Corona': '7.5 x 50', 'Gran Robusto': '5.5 x 54',
        'Lonsdale': '6.5 x 42', 'Lancero': '7.5 x 38', 'Panatela': '6 x 38', 'Figurado': '6 x 52',
        '4x60 Assorted': '4 x 60', 'Assorted': 'Assorted', 'Freestanding': '', 'Large': '', 'Standard': '', 'Unknown': ''
    };

    const handleModelChange = (e) => {
        const { name, value } = e.target;
        setCurrentModel(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'size') {
                const val = value.trim().toLowerCase();
                const key = Object.keys(DIM_MAP).find(k => {
                    const kl = k.toLowerCase();
                    return kl === val || (val.length >= 4 && kl.startsWith(val));
                });
                if (key) {
                    updated.dimensions = DIM_MAP[key];
                }
            }
            return updated;
        });
    };

    const addModel = () => {
        if (!currentModel.name || !currentModel.price || !currentModel.size) {
            alert('Model Name, Size, and Price are required');
            return;
        }

        const modelToSave = { ...currentModel, price: parseFloat(currentModel.price), original_price: currentModel.original_price ? parseFloat(currentModel.original_price) : null, stock: parseInt(currentModel.stock) || 0, image: currentModel.image || '' };

        if (editModelIndex !== null) {
            setFormData(prev => {
                const updatedModels = [...prev.models];
                updatedModels[editModelIndex] = modelToSave;
                return { ...prev, models: updatedModels };
            });
            setEditModelIndex(null);
        } else {
            setFormData(prev => ({
                ...prev,
                models: [...prev.models, modelToSave]
            }));
        }
        setCurrentModel({ name: '', size: '', dimensions: '', price: '', original_price: '', stock: '', image: '', allowed_gifts: [], gift_overrides: {}, disable_gifts: false });
    };

    const removeModel = (index) => {
        setFormData(prev => ({
            ...prev,
            models: prev.models.filter((_, i) => i !== index)
        }));
    };

    const handleNameBlur = () => {
        handleGenerateId();

        if (!formData.name) return;

        // Check if name exists (excluding current ID)
        const existingName = products.find(p => p.name.toLowerCase() === formData.name.toLowerCase() && p.id !== formData.id);

        if (existingName) {
            if (confirm(`A product with the name "${existingName.name}" already exists (ID: ${existingName.id}).\n\nDo you want to EDIT that product (add variants/models to it) instead of creating a new one?\n\nClick OK to Load Existing Product.\nClick Cancel to keep creating a new product.`)) {
                setFormData({
                    id: existingName.id,
                    name: existingName.name,
                    brand_id: existingName.brandId || existingName.brand_id,
                    type: existingName.type,
                    origin: existingName.origin || brandObj?.origin || '',
                    series: existingName.series || '',
                    sampler_series: existingName.sampler_series || '',
                    category: existingName.category || '',
                    description: existingName.description || '',
                    image: existingName.image || '',
                    strength: existingName.strength || 'Medium',
                    flavor_profile: existingName.flavor_profile || [],
                    models: existingName.models || [],
                    has_gifts: existingName.has_gifts || false,
                    available_gifts: existingName.models?.[0]?.product_available_gifts || []
                });
                setStatus({ loading: false, error: '', success: 'Loaded existing product to add variants.' });
            }
        }
    };

    const handleGenerateId = () => {
        if (formData.name && !formData.id) {
            const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, id: slug }));
        }
    };

    const handleLoadProduct = () => {
        if (!formData.id) return;

        const existing = products.find(p => p.id === formData.id);
        if (existing) {
            setFormData({
                id: existing.id,
                name: existing.name,
                brand_id: existing.brandId || existing.brand_id,
                type: existing.type,
                origin: existing.origin || brandObj?.origin || '',
                series: existing.series || '',
                sampler_series: existing.sampler_series || '',
                category: existing.category || '',
                description: existing.description || '',
                image: existing.image || '',
                images: Array.from(new Set([existing.image, ...(existing.images || [])])).filter(Boolean),
                strength: existing.strength || 'Medium',
                flavor_profile: existing.flavor_profile || [],
                models: existing.models || [],
                has_gifts: existing.has_gifts || false,
                available_gifts: existing.models?.[0]?.product_available_gifts || []
            });
            setStatus({ loading: false, error: '', success: 'Product loaded!' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setStatus({ loading: false, error: 'Product ID not found locally', success: '' });
        }
    };

    // Helper for "Select or Add New" (Persistent Version)
    const CreatableSelect = ({ label, name, value, options, onChange, placeholder, category }) => {
        const [isAdding, setIsAdding] = useState(false);
        const [newValue, setNewValue] = useState('');
        const [saving, setSaving] = useState(false);

        const handleSaveNew = async () => {
            if (!newValue.trim()) return;
            setSaving(true);
            try {
                // Use the explicit category prop if available, otherwise fallback to field name
                // e.g. field 'brand_id' -> category 'brand'
                let cat = category || name;
                if (name === 'brand_id') cat = 'brand';

                const payload = { category: cat, value: newValue.trim() };
                if (cat === 'brand') {
                    const logoInput = document.getElementById('newBrandLogoInput');
                    let logoUrl = '';

                    if (logoInput && logoInput.files && logoInput.files.length > 0) {
                        const file = logoInput.files[0];
                        const formData = new FormData();
                        formData.append('file', file);

                        const uploadRes = await fetch('/api/admin/upload-image', {
                            method: 'POST',
                            body: formData
                        });

                        const uploadData = await uploadRes.json();
                        if (uploadData.success && uploadData.url) {
                            logoUrl = uploadData.url;
                        } else {
                            alert('Logo upload failed: ' + (uploadData.error || 'Unknown error'));
                            setSaving(false);
                            return; // Stop saving brand if image fails
                        }
                    }

                    payload.metadata = { type: formData.type, logo: logoUrl };
                }

                const res = await fetch('/api/admin/attributes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const json = await res.json();

                if (json.success) {
                    // Update local persistent state immediately
                    setPersistentAttributes(prev => {
                        const existing = prev[cat] || [];
                        if (existing.includes(newValue.trim())) return prev;
                        return {
                            ...prev,
                            [cat]: [...existing, newValue.trim()].sort()
                        };
                    });

                    if (cat === 'brand') {
                        setAttributeMetadata(prev => ({
                            ...prev,
                            [newValue.trim()]: { type: formData.type }
                        }));
                    }

                    // Select the new value via the parent's onChange
                    // For brand_id, we need to pass { value: id, label: name } structure potentially? 
                    // No, standard selects usually just take the value string.
                    // But for Brands, the parent expects an ID. If the brand doesn't exist in BRANDS, 
                    // the dynamicOptions logic needs to see it in persistentAttributes to add it to the list.

                    onChange({ target: { name, value: newValue.trim() } });

                    setIsAdding(false);
                    setNewValue('');
                } else {
                    alert('Failed to save: ' + (json.error || 'Unknown error'));
                }
            } catch (err) {
                console.error(err);
                alert('Error saving attribute');
            } finally {
                setSaving(false);
            }
        };

        return (
            <div className={styles.formGroup}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {label}
                    {!isAdding && (
                        <button
                            type="button"
                            onClick={() => setIsAdding(true)}
                            style={{ fontSize: '0.8rem', background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            + Add New
                        </button>
                    )}
                </label>
                {isAdding ? (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <input
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            className={styles.input}
                            placeholder={`Enter new ${label}...`}
                            style={{ flex: 1, minWidth: '150px' }}
                            autoFocus
                        />
                        {category === 'brand' || name === 'brand_id' ? (
                            <input
                                id="newBrandLogoInput"
                                type="file"
                                accept=".svg, image/svg+xml"
                                title="Brand Logo (Strictly .SVG)"
                                className={`${styles.input} file:bg-white file:text-[#120C0A] file:px-4 file:py-2 file:rounded-full file:border-none file:font-semibold file:cursor-pointer hover:file:bg-[#C5A35C] transition-all`}
                                style={{ flex: 1, minWidth: '150px', padding: '0.2rem' }}
                            />
                        ) : null}
                        <button
                            type="button"
                            onClick={handleSaveNew}
                            disabled={saving}
                            style={{ background: 'var(--color-accent)', color: '#000', border: 'none', padding: '0 1rem', borderRadius: '4px', whiteSpace: 'nowrap' }}
                        >
                            {saving ? '...' : 'Save'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '0 0.5rem', borderRadius: '4px' }}
                        >
                            X
                        </button>
                    </div>
                ) : (
                    <select name={name} value={value} onChange={onChange} className={styles.select}>
                        <option value="">-- Select --</option>
                        {options.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                )}
            </div>
        );
    };

    // --- Handlers for Image & Description & Submit ---
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploadingImage(true);
        const uploadedUrls = [];

        try {
            for (const file of files) {
                // Validations
                if (file.size > 5 * 1024 * 1024) {
                    alert(`Skipped ${file.name}: File size must be less than 5MB`);
                    continue;
                }
                if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
                    alert(`Skipped ${file.name}: Only JPG, PNG, WEBP, GIF allowed`);
                    continue;
                }

                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/admin/upload-image', {
                    method: 'POST',
                    body: formData
                });

                const data = await res.json();
                if (data.success) {
                    uploadedUrls.push(data.url);
                } else {
                    alert(`Failed to upload ${file.name}: ` + (data.error || 'Unknown error'));
                }
            }

            if (uploadedUrls.length > 0) {
                setFormData(prev => {
                    const newImages = [...(prev.images || []), ...uploadedUrls];
                    return {
                        ...prev,
                        images: newImages,
                        image: prev.image || newImages[0] // Set main image if empty
                    };
                });
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Image upload failed: ' + error.message);
        } finally {
            setUploadingImage(false);
            // Reset file input value to allow re-uploading same file if needed
            e.target.value = '';
        }
    };

    const handleAddImageUrl = () => {
        const url = prompt("Enter Image URL:");
        if (url) {
            setFormData(prev => {
                const newImages = [...(prev.images || []), url];
                return {
                    ...prev,
                    images: newImages,
                    image: prev.image || newImages[0]
                };
            });
        }
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => {
            const newImages = prev.images.filter((_, i) => i !== index);
            return {
                ...prev,
                images: newImages,
                image: newImages[0] || ''
            };
        });
    };

    const moveImage = (index, direction) => {
        setFormData(prev => {
            const newImages = [...(prev.images || [])];
            if (direction === 'left' && index > 0) {
                [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
            } else if (direction === 'right' && index < newImages.length - 1) {
                [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
            }
            return { ...prev, images: newImages, image: newImages[0] || '' };
        });
    };

    const handleSetMainImage = (url) => {
        setFormData(prev => {
            return { ...prev, image: url };
        });
    };

    const handleDescriptionUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setParsingDesc(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Using the existing extract-text route
            const res = await fetch('/api/admin/extract-text', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success && data.text) {
                setFormData(prev => ({ ...prev, description: data.text }));
            } else {
                alert('Text extraction failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('Error extracting text: ' + err.message);
        } finally {
            setParsingDesc(false);
        }
    };

    const handleSubmitProduct = async () => {
        if (!formData.name || !formData.brand_id) {
            setStatus({ loading: false, error: 'Name and Brand are required', success: '' });
            return;
        }

        setStatus({ loading: true, error: '', success: '' });
        let targetId = formData.id;
        if (!targetId) {
            targetId = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            setFormData(prev => ({ ...prev, id: targetId }));
        }

        try {
            const payload = {
                ...formData,
                id: targetId,
                price: formData.models[0]?.price || 0,
                rating: formData.rating === '' ? null : formData.rating,
                admin_secret: 'admin@129'
            };

            console.log('Submitting Payload:', payload);

            const res = await fetch('/api/products', {
                method: formData.id && products.some(p => p.id === formData.id) ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ loading: false, error: '', success: 'Product saved successfully!' });
                refreshProducts();
                resetForm();
            } else {
                setStatus({ loading: false, error: data.error || 'Failed to save', success: '' });
            }
        } catch (err) {
            setStatus({ loading: false, error: err.message, success: '' });
        }
    };

    // --- Dynamic Options Logic (Restored) ---
    const dynamicOptions = useMemo(() => {
        const existingBrands = new Set([...BRANDS.map(b => b.id), ...(persistentAttributes.brand || [])]);
        const existingOrigins = new Set([...BRANDS.map(b => b.origin).filter(Boolean), ...(persistentAttributes.origin || [])]);

        const existingSizes = new Set(['Robusto', 'Toro', 'Churchill', 'Corona', 'Gordo', 'Panatela', 'Lancero', 'Perfecto', ...(persistentAttributes.size || [])]);
        const existingVariants = new Set(['Single Stick', 'Box of 10', 'Box of 20', 'Box of 25', 'Pack of 5', 'Tin of 20', ...(persistentAttributes.variant || [])]);
        const existingDimensions = new Set(['5x50', '6x52', '6x60', '7x48', '5.5x42', ...(persistentAttributes.dimension || [])]);
        const existingSeries = new Set([...(persistentAttributes.series || [])]);

        const customBrands = [];
        const customOrigins = new Set();
        const customSizes = new Set();
        const customVariants = new Set();
        const customDimensions = new Set();
        const customSeries = new Set();
        
        Object.values(DIM_MAP).forEach(d => {
            if (d) customDimensions.add(d);
        });

        const isDimension = (str) => /^\d+(\.\d+)?\s*x\s*\d+$/.test(str);

        const processProduct = (p) => {
            const brandId = p.brandId || p.brand_id;
            if (brandId && !existingBrands.has(brandId)) {
                customBrands.push({ id: brandId, name: brandId, type: p.type || 'cigar' });
                existingBrands.add(brandId);
            }
            if (p.origin && !existingOrigins.has(p.origin)) customOrigins.add(p.origin);
            if (p.series && !existingSeries.has(p.series)) customSeries.add(p.series);

            if (Array.isArray(p.models)) {
                p.models.forEach(m => {
                    if (m.size) {
                        if (isDimension(m.size)) {
                            if (!existingDimensions.has(m.size)) customDimensions.add(m.size);
                        } else {
                            if (!existingSizes.has(m.size)) customSizes.add(m.size);
                        }
                    }
                    if (m.name && !existingVariants.has(m.name)) customVariants.add(m.name);
                    if (m.dimensions && !existingDimensions.has(m.dimensions)) customDimensions.add(m.dimensions);
                });
            }
        };

        products.forEach(processProduct);
        processProduct(formData);

        const deduplicate = (set) => {
            const map = new Map();
            for (const item of set) {
                if (typeof item === 'string') {
                    const lower = item.toLowerCase();
                    if (!map.has(lower)) {
                        map.set(lower, item);
                    } else if (item && item[0] === item[0].toUpperCase() && map.get(lower)[0] !== map.get(lower)[0].toUpperCase()) {
                        // Prefer Capitalized version
                        map.set(lower, item);
                    }
                } else {
                    map.set(item, item);
                }
            }
            return Array.from(map.values());
        };

        const sortAlpha = (set) => deduplicate(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        return {
            customBrands,
            allOrigins: sortAlpha(new Set([...existingOrigins, ...customOrigins])),
            allSeries: sortAlpha(new Set([...existingSeries, ...customSeries])),
            allSizes: sortAlpha(new Set([...existingSizes, ...customSizes])),
            allVariants: sortAlpha(new Set([...existingVariants, ...customVariants])),
            allDimensions: sortAlpha(new Set([...existingDimensions, ...customDimensions]))
        };
    }, [products, formData, persistentAttributes]);

    // Filter Brands (Static + Dynamic + Persistent) based on Type
    // This fixes the bug where newly added brands disappear from the dropdown
    const filteredBrands = useMemo(() => {
        // 1. Static Brands
        const staticFiltered = BRANDS.filter(b => {
            if (formData.type === 'accessory') return b.type === 'accessory';
            return b.type === 'cigar' || !b.type;
        });

        // 2. Custom Brands from existing products
        const dynamicFiltered = dynamicOptions.customBrands.filter(b => {
            if (formData.type === 'accessory') return b.type === 'accessory';
            return b.type !== 'accessory';
        });

        // 3. Persistent Attributes (Newly added ones)
        // Filter by metadata type if available
        const persistentFiltered = (persistentAttributes.brand || []).filter(b => {
            const meta = attributeMetadata[b];
            if (!meta || !meta.type) return true; // Show if no type specified (legacy/global)
            if (formData.type === 'accessory') return meta.type === 'accessory';
            return meta.type !== 'accessory'; // Assume cigar/cigarillo/etc are similar
        }).map(b => ({
            id: b,
            name: b,
            type: attributeMetadata[b]?.type || 'cigar'
        }));

        // Merge and dedup by ID/Name
        const combined = [...staticFiltered, ...dynamicFiltered, ...persistentFiltered];
        const unique = [];
        const seen = new Set();

        for (const b of combined) {
            // Normalize ID comparison
            const bid = b.id || b.name;
            if (!seen.has(bid)) {
                seen.add(bid);
                unique.push(b);
            }
        }
        return unique.sort((a, b) => a.name.localeCompare(b.name));
    }, [formData.type, dynamicOptions.customBrands, persistentAttributes.brand, attributeMetadata]);

    const filteredSeries = useMemo(() => {
        if (!formData.brand_id) return dynamicOptions.allSeries;

        const seriesForThisBrand = new Set();
        
        products.forEach(p => {
            if ((p.brandId || p.brand_id) === formData.brand_id && p.series) {
                seriesForThisBrand.add(p.series);
            }
        });

        if (formData.series) {
            seriesForThisBrand.add(formData.series);
        }

        return Array.from(seriesForThisBrand).sort();
    }, [formData.brand_id, formData.series, products, dynamicOptions.allSeries]);

    // --- Filtered Products Logic ---
    const filteredProductsList = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
                p.id.toLowerCase().includes(adminSearch.toLowerCase());
            const matchesType = adminFilterType === 'all' || p.type === adminFilterType;
            const matchesBrand = adminFilterBrand === 'all' || (p.brandId || p.brand_id) === adminFilterBrand;

            let matchesStock = true;
            if (adminFilterStock === 'in_stock') {
                matchesStock = p.models?.some(m => parseInt(m.stock || 0) > 0);
            } else if (adminFilterStock === 'out_of_stock') {
                matchesStock = p.models?.every(m => parseInt(m.stock || 0) <= 0);
            }

            let matchesSize = true;
            if (adminFilterSize !== 'all') {
                matchesSize = p.models?.some(m => m.size === adminFilterSize || m.dimensions === adminFilterSize);
            }

            return matchesSearch && matchesType && matchesBrand && matchesStock && matchesSize;
        });
    }, [products, adminSearch, adminFilterType, adminFilterBrand, adminFilterStock, adminFilterSize]);

    // Unique Brands for Filter Dropdown (Adaptive)
    const availableBrands = useMemo(() => {
        // Filter brands based on the selected Type filter
        const typeFilteredIds = new Set(products
            .filter(p => adminFilterType === 'all' || p.type === adminFilterType)
            .map(p => p.brandId || p.brand_id)
            .filter(Boolean)
        );

        // Combine static brands and persistent/dynamic brands
        const all = [...BRANDS, ...(dynamicOptions.customBrands || [])];

        // Add persistent brands that match the filter
        const persistentRelevant = (persistentAttributes.brand || []).filter(b => {
            const meta = attributeMetadata[b];
            if (!meta || !meta.type) return true;
            if (adminFilterType === 'all') return true;
            return meta.type === adminFilterType;
        }).map(b => ({ id: b, name: b }));

        const combinedAll = [...all, ...persistentRelevant];

        // Dedup
        const uniqueAll = [];
        const seen = new Set();
        combinedAll.forEach(b => {
            if (!seen.has(b.id || b.name)) {
                seen.add(b.id || b.name);
                uniqueAll.push(b);
            }
        });

        // Return only brands that have products of the selected type OR are relevant persistent brands
        return uniqueAll.filter(b => typeFilteredIds.has(b.id) || (attributeMetadata[b.id] && (adminFilterType === 'all' || attributeMetadata[b.id].type === adminFilterType))).sort((a, b) => a.name.localeCompare(b.name));
    }, [products, dynamicOptions.customBrands, adminFilterType, persistentAttributes.brand, attributeMetadata]);

    if (authLoading || !user) return <div className="container" style={{ padding: '2rem' }}>Authenticating...</div>;
    if (user.role !== 'admin') return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}><h2>Access Denied</h2><p>You do not have permission to view this page.</p></div>;

    const handleBroadcastCollection = async () => {
        if (!confirm('Are you sure you want to broadcast the latest items (last 48h) to Telegram?')) return;
        
        try {
            const res = await fetch('/api/admin/broadcast-collection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admin_secret: 'admin@129' })
            });
            const data = await res.json();
            
            if (data.success) {
                alert('Broadcast initiated successfully!');
            } else {
                alert('Broadcast failed: ' + (data.message || data.error));
            }
        } catch (error) {
            console.error(error);
            alert('Error initiating broadcast');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Admin Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span>{user.email}</span>
                    <button onClick={() => router.push('/')} className="btn-outline">{t('back_to_shop')}</button>
                </div>
            </div>

            <div className={styles.tabs}>
                {adminTabsOrder.map((tab, index) => (
                    <button
                        key={tab.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ cursor: 'grab' }}
                    >
                        {t(tab.labelKey)}
                    </button>
                ))}
            </div>

            {activeTab === 'products' && (
                <AdminProductsTab 
                    t={t} user={user} products={products} refreshProducts={refreshProducts} 
                    toggleProductVisibilityOptimistically={toggleProductVisibilityOptimistically}
                    adminSearch={adminSearch} setAdminSearch={setAdminSearch}
                    adminFilterType={adminFilterType} setAdminFilterType={setAdminFilterType}
                    adminFilterBrand={adminFilterBrand} setAdminFilterBrand={setAdminFilterBrand}
                    adminFilterStock={adminFilterStock} setAdminFilterStock={setAdminFilterStock}
                    adminFilterSize={adminFilterSize} setAdminFilterSize={setAdminFilterSize}
                    persistentAttributes={persistentAttributes}
                    formData={formData} setFormData={setFormData}
                    currentModel={currentModel} setCurrentModel={setCurrentModel}
                    editModelIndex={editModelIndex} setEditModelIndex={setEditModelIndex}
                    resetForm={resetForm} status={status} setStatus={setStatus}
                    parsingDesc={parsingDesc} setParsingDesc={setParsingDesc}
                    uploadingImage={uploadingImage} setUploadingImage={setUploadingImage}
                    draggedImageIndex={draggedImageIndex} handleImageDragStart={handleImageDragStart}
                    handleImageDragOver={handleImageDragOver} handleImageDrop={handleImageDrop}
                    previewImage={previewImage} setPreviewImage={setPreviewImage}
                    handleAddFlavor={handleAddFlavor} handleInputChange={handleInputChange}
                    handleModelChange={handleModelChange} handleNameBlur={handleNameBlur}
                    handleGenerateId={handleGenerateId} handleLoadProduct={handleLoadProduct}
                    handleImageUpload={handleImageUpload} handleAddImageUrl={handleAddImageUrl}
                    handleRemoveImage={handleRemoveImage} handleSetMainImage={handleSetMainImage}
                    handleDescriptionUpload={handleDescriptionUpload} handleSubmitProduct={handleSubmitProduct}
                    handleSaveGiftOption={handleSaveGiftOption} handleGiftImageUpload={handleGiftImageUpload}

                />
            )
            }

            {
                activeTab === 'orders' && (
                <AdminOrdersTab 
                    adminOrders={adminOrders} setAdminOrders={setAdminOrders}
                    orderSearch={orderSearch} setOrderSearch={setOrderSearch}
                    orderStatusFilter={orderStatusFilter} setOrderStatusFilter={setOrderStatusFilter}
                    orderDateFilter={orderDateFilter} setOrderDateFilter={setOrderDateFilter}
                    expandedOrderId={expandedOrderId} setExpandedOrderId={setExpandedOrderId}
                    handleConfirmOrder={handleConfirmOrder} handleCancelOrder={handleCancelOrder}
                    confirmingOrder={confirmingOrder}
                    user={user}
                />
            )
            }
            {
                activeTab === 'attributes' && (
                <AdminAttributesTab 
                    persistentAttributes={persistentAttributes} setPersistentAttributes={setPersistentAttributes}
                    hiddenAttributes={hiddenAttributes} setHiddenAttributes={setHiddenAttributes}
                    attributeMetadata={attributeMetadata} setAttributeMetadata={setAttributeMetadata}
                    newAttributeForm={newAttributeForm} setNewAttributeForm={setNewAttributeForm}
                    autoHideStock={autoHideStock} setAutoHideStock={setAutoHideStock}
                    products={products}
                />
            )
            }
            {
                activeTab === 'users' && (
                <AdminUsersTab 
                    adminUsers={adminUsers} setAdminUsers={setAdminUsers}
                    expandedUserId={expandedUserId} setExpandedUserId={setExpandedUserId}
                />
            )
            }
            {
                activeTab === 'promotions' && (
                    <AdminPromotions products={products} brands={BRANDS} />
                )
            }
            {
                activeTab === 'promos' && (
                    <AdminPromoCodes />
                )
            }
            {
                activeTab === 'marketing' && (
                    <AdminMarketing />
                )
            }
            {/* BRAND EDITING MODAL */}
            {editingBrand && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100000 }}>
                    <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', border: '1px solid #333' }}>
                        <h2 style={{ color: 'var(--color-accent)', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Edit Brand: {editingBrand.oldVal}</h2>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Brand Name</label>
                            <input 
                                type="text" 
                                value={editingBrand.value} 
                                onChange={(e) => setEditingBrand({...editingBrand, value: e.target.value})} 
                                style={{ width: '100%', padding: '0.8rem', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} 
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Brand Logo (SVG or Image)</label>
                            {editingBrand.image && (
                                <div style={{ marginBottom: '1rem', background: '#222', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <img src={editingBrand.image} alt="Logo Preview" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*,.svg"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                        const uploadData = new FormData();
                                        uploadData.append('file', file);
                                        const res = await fetch('/api/admin/upload-image', { method: 'POST', body: uploadData });
                                        if (!res.ok) throw new Error('Upload failed');
                                        const data = await res.json();
                                        setEditingBrand({...editingBrand, image: data.url});
                                    } catch (err) {
                                        alert('Error uploading logo: ' + err.message);
                                    }
                                }}
                                style={{ width: '100%', padding: '0.5rem', border: '1px dashed #555', borderRadius: '4px', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => setEditingBrand(null)} 
                                style={{ padding: '0.8rem 1.5rem', background: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={async () => {
                                    if (!editingBrand.value.trim()) return alert("Name cannot be empty");
                                    const cleanedVal = editingBrand.value.trim();
                                    const oldVal = editingBrand.oldVal;
                                    const category = 'brand';
                                    try {
                                        if (editingBrand.isPersistent && editingBrand.id) {
                                            // Update Persistent
                                            const res = await fetch('/api/admin/attributes', {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ id: editingBrand.id, category, value: cleanedVal, metadata: { image: editingBrand.image } })
                                            });
                                            if (!res.ok) throw new Error('Failed to update brand');
                                            
                                            setPersistentAttributes(prev => ({
                                                ...prev, [category]: prev[category].map(v => v === oldVal ? cleanedVal : v)
                                            }));
                                            setAttributeMetadata(prev => {
                                                const next = { ...prev };
                                                next[cleanedVal] = { ...next[oldVal], id: editingBrand.id, image: editingBrand.image };
                                                delete next[oldVal];
                                                return next;
                                            });
                                        } else {
                                            // It was a dynamically created one or new 
                                            const resAdd = await fetch('/api/admin/attributes', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ category, value: cleanedVal, metadata: { image: editingBrand.image } })
                                            });
                                            if (!resAdd.ok) throw new Error('Failed to save new brand');
                                            
                                            const resHide = await fetch('/api/admin/attributes', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ category, value: oldVal, metadata: { hidden: true } })
                                            });
                                            if (!resHide.ok) throw new Error('Failed to hide old brand');

                                            setPersistentAttributes(prev => ({
                                                ...prev, [category]: [...(prev[category] || []), cleanedVal]
                                            }));
                                            setHiddenAttributes(prev => ({
                                                ...prev, [category]: [...(prev[category] || []), oldVal]
                                            }));
                                            setAttributeMetadata(prev => {
                                                const next = { ...prev };
                                                next[cleanedVal] = { image: editingBrand.image };
                                                return next;
                                            });
                                        }
                                        setEditingBrand(null);
                                        alert("Brand updated successfully! (Refresh shop to see changes if using static fallback)");
                                    } catch (err) {
                                        alert("Error: " + err.message);
                                    }
                                }} 
                                style={{ padding: '0.8rem 1.5rem', background: 'var(--color-accent)', border: 'none', color: '#111', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
