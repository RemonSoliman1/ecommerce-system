'use client';

import React, { useState, useMemo, useEffect } from 'react';
import styles from './QuickAddModal.module.css';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useTranslations } from 'next-intl';

export default function QuickAddModal({ product, onClose }) {
    const { addToCart, setIsOpen } = useCart();
    const { showToast } = useToast();
    const t = useTranslations('Product');

    const validModels = useMemo(() => {
        if (!product || !Array.isArray(product.models)) return [];
        return product.models.filter(m => m && typeof m === 'object' && m.price !== undefined && m.price !== null);
    }, [product]);

    const modelsBySize = useMemo(() => {
        return validModels.reduce((acc, model) => {
            const sizeKey = model.size || 'Standard';
            if (!acc[sizeKey]) acc[sizeKey] = [];
            acc[sizeKey].push(model);
            return acc;
        }, {});
    }, [validModels]);

    const sizes = useMemo(() => Object.keys(modelsBySize), [modelsBySize]);
    
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedModel, setSelectedModel] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (sizes.length > 0 && !selectedSize) {
            const firstSize = sizes[0];
            setSelectedSize(firstSize);
            const models = modelsBySize[firstSize];
            if (models && models.length > 0) {
                setSelectedModel(models[0]);
            }
        }
    }, [sizes, modelsBySize, selectedSize]);

    const availableModels = useMemo(() => {
        return selectedSize ? modelsBySize[selectedSize] : [];
    }, [selectedSize, modelsBySize]);

    const handleAdd = () => {
        if (!selectedModel) return;
        const maxStock = parseInt(selectedModel.stock || 0);
        
        if (maxStock <= 0) {
            showToast('Item is out of stock', 'error');
            return;
        }
        
        if (quantity > maxStock) {
            showToast(`Only ${maxStock} items available`, 'error');
            return;
        }

        addToCart(product, selectedSize, selectedModel.price, quantity, null);
        showToast(t('added_to_cart') || 'Added to cart!', 'success');
        setIsOpen(true);
        onClose();
    };

    const priceToDisplay = selectedModel ? selectedModel.price : (validModels[0]?.price || 0);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                <div className={styles.header}>
                    <img src={product.image} alt={product.name} className={styles.productImg} />
                    <div>
                        <h3 className={styles.title}>{product.name}</h3>
                        <p className={styles.price}>EGP {priceToDisplay.toLocaleString()}</p>
                    </div>
                </div>

                <div className={styles.body}>
                    {sizes.length > 1 && (
                        <div className={styles.optionGroup}>
                            <label>Size / Vitola</label>
                            <div className={styles.buttonGrid}>
                                {sizes.map(size => (
                                    <button 
                                        key={size}
                                        className={`${styles.optionBtn} ${selectedSize === size ? styles.active : ''}`}
                                        onClick={() => {
                                            setSelectedSize(size);
                                            setSelectedModel(modelsBySize[size][0]);
                                            setQuantity(1);
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {availableModels && availableModels.length > 1 && (
                        <div className={styles.optionGroup}>
                            <label>Option</label>
                            <div className={styles.buttonGrid}>
                                {availableModels.map(model => (
                                    <button 
                                        key={model.name}
                                        className={`${styles.optionBtn} ${selectedModel?.name === model.name ? styles.active : ''}`}
                                        onClick={() => {
                                            setSelectedModel(model);
                                            setQuantity(1);
                                        }}
                                    >
                                        {model.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.quantityGroup}>
                        <label>Quantity</label>
                        <div className={styles.qtyControls}>
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button 
                        className={styles.addBtn}
                        onClick={handleAdd}
                        disabled={!selectedModel || parseInt(selectedModel.stock || 0) <= 0}
                    >
                        {selectedModel && parseInt(selectedModel.stock || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}
