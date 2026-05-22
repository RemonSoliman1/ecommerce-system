'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [visibleProducts, setVisibleProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [autoHideStock, setAutoHideStock] = useState(false);
    const [activePromos, setActivePromos] = useState([]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const [prodRes, brandRes, settingsRes, promosRes] = await Promise.all([
                fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' }),
                fetch(`/api/brands?t=${Date.now()}`, { cache: 'no-store' }),
                fetch(`/api/admin/attributes?category=setting`, { cache: 'no-store' }),
                fetch(`/api/promotions/active?t=${Date.now()}`, { cache: 'no-store' })
            ]);
            
            const prodData = await prodRes.json();
            const brandData = await brandRes.json();
            const settingsData = await settingsRes.json();
            const promosData = await promosRes.json();
            
            if (promosData.success) {
                setActivePromos(promosData.promos || []);
            }

            let isAutoHide = false;
            if (settingsData.success) {
                const setting = settingsData.data?.find(s => s.value === 'auto_hide_out_of_stock');
                if (setting && setting.metadata?.enabled) {
                    isAutoHide = true;
                }
            }
            setAutoHideStock(isAutoHide);

            if (prodData.error) throw new Error(prodData.error);
            setProducts(prodData);
            
            // Generate strictly visible products for storefront
            const filtered = prodData.filter(p => {
                if (p.is_visible === false) return false;
                if (p.is_visible === null) return true; // Force visible override
                if (isAutoHide) {
                    const hasStock = p.models?.some(m => parseInt(m.stock || 0) > 0);
                    if (!hasStock) return false;
                }
                return true;
            });
            setVisibleProducts(filtered);
            
            if (brandData.success) {
                setBrands(brandData.brands);
            }
        } catch (err) {
            console.error('Failed to load products/brands:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const toggleProductVisibilityOptimistically = (productId, newVisibility) => {
        setProducts(prevProducts => {
            const nextProducts = prevProducts.map(p => p.id === productId ? { ...p, is_visible: newVisibility } : p);
            
            // Recompute visibleProducts based on updated products and current autoHideStock state
            const nextVisible = nextProducts.filter(p => {
                if (p.is_visible === false) return false;
                if (p.is_visible === null) return true; // Force visible override
                if (autoHideStock) {
                    const hasStock = p.models?.some(m => parseInt(m.stock || 0) > 0);
                    if (!hasStock) return false;
                }
                return true;
            });
            setVisibleProducts(nextVisible);
            
            return nextProducts;
        });
    };

    const refreshProducts = () => {
        fetchProducts();
    };

    return (
        <ProductContext.Provider value={{ products, visibleProducts, brands, activePromos, loading, error, refreshProducts, autoHideStock, toggleProductVisibilityOptimistically }}>
            {children}
        </ProductContext.Provider>
    );
}

export const useProducts = () => useContext(ProductContext);
