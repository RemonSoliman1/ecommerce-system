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
import AdminAnalyticsTab from './components/AdminAnalyticsTab';
import AdminAttributesTab from './components/AdminAttributesTab';
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
        { id: 'marketing', labelKey: 'tabs_marketing' },
        { id: 'analytics', labelKey: 'tabs_analytics' }
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
                const isVideo = file.type.startsWith('video/');

                if (!isVideo && file.size > 5 * 1024 * 1024) {
                    alert(`Skipped ${file.name}: Image size must be less than 5MB`);
                    continue;
                }
                
                if (isVideo && file.size > 100 * 1024 * 1024) {
                    alert(`Skipped ${file.name}: Video size must be less than 100MB`);
                    continue;
                }

                if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
                    alert(`Skipped ${file.name}: Unsupported format`);
                    continue;
                }

                if (isVideo) {
                    const res = await fetch('/api/admin/upload-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fileName: file.name, fileType: file.type })
                    });
                    const data = await res.json();
                    
                    if (data.success) {
                        const uploadRes = await fetch(data.signedUrl, {
                            method: 'PUT',
                            headers: { 'Content-Type': file.type },
                            body: file
                        });
                        if (uploadRes.ok) {
                            uploadedUrls.push(data.publicUrl);
                        } else {
                            alert(`Failed to upload video ${file.name} to storage bucket.`);
                        }
                    } else {
                        alert(`Failed to get signed URL for ${file.name}: ` + (data.error || 'Unknown error'));
                    }
                } else {
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
                rating: formData.rating === '' ? null : formData.rating
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
                body: JSON.stringify({ })
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
                                    <span className={styles.fileUploadLabel}>[ 📁 UPLOAD MEDIA ]</span>
                                    <input
                                        type="file"
                                        accept="image/*,video/mp4,video/webm,video/quicktime"
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
                                        {img.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
                                            <video src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => setPreviewImage(img)} />
                                        ) : (
                                            <img src={img} alt={`Img ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }} onClick={() => setPreviewImage(img)} />
                                        )}
                                        
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
                                    {previewImage.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
                                        <video src={previewImage} controls autoPlay style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} />
                                    ) : (
                                        <img src={previewImage} style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} />
                                    )}
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
                                                                body: JSON.stringify({ id: p.id, is_visible: newVisible })
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
                                                                const res = await fetch(`/api/products?id=${p.id}`, { method: 'DELETE' });
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
            )
            }

            {activeTab === 'orders' && (
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
            )}

            {activeTab === 'attributes' && (
                <AdminAttributesTab
                    persistentAttributes={persistentAttributes} setPersistentAttributes={setPersistentAttributes}
                    hiddenAttributes={hiddenAttributes} setHiddenAttributes={setHiddenAttributes}
                    attributeMetadata={attributeMetadata} setAttributeMetadata={setAttributeMetadata}
                    newAttributeForm={newAttributeForm} setNewAttributeForm={setNewAttributeForm}
                    autoHideStock={globalAutoHide} setAutoHideStock={() => {}}
                    products={products}
                    dynamicOptions={dynamicOptions}
                    allFlavorOptions={allFlavorOptions}
                    setEditingBrand={setEditingBrand}
                    giftOptionForm={giftOptionForm}
                    setGiftOptionForm={setGiftOptionForm}
                    uploadingGiftImage={uploadingGiftImage}
                    handleGiftImageUpload={handleGiftImageUpload}
                    handleSaveGiftOption={handleSaveGiftOption}
                    editingGiftId={editingGiftId}
                    setEditingGiftId={setEditingGiftId}
                    setEditingGiftOldName={setEditingGiftOldName}
                    checkoutCustomerSearch={checkoutCustomerSearch}
                    setCheckoutCustomerSearch={setCheckoutCustomerSearch}
                    adminUsers={adminUsers}
                />
            )}

            {activeTab === 'users' && (
                <AdminUsersTab
                    adminUsers={adminUsers} setAdminUsers={setAdminUsers}
                    expandedUserId={expandedUserId} setExpandedUserId={setExpandedUserId}
                />
            )}
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
