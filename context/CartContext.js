'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useTelegram } from './TelegramContext';
import { useRouter } from '@/lib/navigation';
import { useProducts } from './ProductContext';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const { isTelegram, setMainButton } = useTelegram();
    const router = useRouter();
    const { products } = useProducts();

    // Load from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cigar_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    const [promoCode, setPromoCode] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    // Sync Promo from LocalStorage
    useEffect(() => {
        const checkPromo = () => {
            const saved = localStorage.getItem('pending_promo_code');
            if (saved !== promoCode) setPromoCode(saved);
        };
        checkPromo();
        window.addEventListener('storage', checkPromo); // Sync across tabs/modals
        // Polling interval to catch local storage changes in the same tab if events aren't firing
        const interval = setInterval(checkPromo, 1000);
        return () => {
            window.removeEventListener('storage', checkPromo);
            clearInterval(interval);
        };
    }, [promoCode]);

    // Validate Promo against Current Cart
    useEffect(() => {
        if (!promoCode || cart.length === 0) {
            setDiscountAmount(0);
            return;
        }

        const validatePromo = async () => {
            try {
                const subtotal = cart.reduce((total, item) => total + (item.price + (item.giftOption ? item.giftOption.price : 0)) * item.quantity, 0);
                const res = await fetch('/api/promotions/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        code: promoCode,
                        cart: cart,
                        cartTotal: subtotal,
                        email: null, 
                        paymentMethod: null
                    })
                });
                const data = await res.json();
                if (data.success && data.discountAmount !== undefined) {
                    setDiscountAmount(data.discountAmount);
                } else {
                    setDiscountAmount(0);
                }
            } catch (e) {
                setDiscountAmount(0);
            }
        };

        validatePromo();
    }, [cart, promoCode]);

    // Live Inventory Auto-Crush Validation
    useEffect(() => {
        if (products && products.length > 0 && cart.length > 0) {
            setCart(prevCart => {
                let hasChanges = false;
                const validatedCart = prevCart.map(item => {
                    const baseName = (item.name || '').replace(/ \(Gift:.*?\)/i, '').trim().toLowerCase();
                    const liveProduct = products.find(p => p.id === item.id || p.name.toLowerCase() === baseName);

                    if (liveProduct) {
                        const liveStock = liveProduct.models?.find(m => {
                            const mName = (m.name || '').toLowerCase();
                            const mSize = (m.size || '').toLowerCase();
                            const cSize = (item.selectedSize || '').toLowerCase();
                            return (mName && cSize.includes(mName)) || (mSize && cSize.includes(mSize));
                        })?.stock;

                        const maxStock = liveStock !== undefined ? parseInt(liveStock, 10) : 9999;

                        if (item.stock !== maxStock || item.quantity > maxStock) {
                            hasChanges = true;
                            return { ...item, stock: maxStock, quantity: Math.min(item.quantity, Math.max(0, maxStock)) };
                        }
                    }
                    return item;
                }).filter(item => {
                    if (item.stock <= 0) {
                        hasChanges = true;
                        return false;
                    }
                    return true;
                });

                return hasChanges ? validatedCart : prevCart;
            });
        }
    }, [products]);

    // Derived state (calculated on render, no need for separate state or redeclaration)
    const cartSubtotal = cart.reduce((total, item) => {
        const itemTotal = (item.price + (item.giftOption ? item.giftOption.price : 0)) * item.quantity;
        return total + itemTotal;
    }, 0);
    const cartTotal = Math.max(0, cartSubtotal - discountAmount);

    // Sync with Telegram MainButton
    useEffect(() => {
        if (!isTelegram) return;

        if (cart.length > 0) {
            setMainButton({
                text: `VIEW CART ($${cartTotal.toFixed(2)})`,
                color: '#C6A87C', // Gold accent
                textColor: '#000000',
                isVisible: true,
                isActive: true,
                onClick: () => router.push('/cart')
            });
        } else {
            setMainButton({ isVisible: false });
        }
    }, [cart, isTelegram, cartTotal, router]);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('cigar_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, size, price, quantity = 1, giftOption = null) => {
        const maxAddQty = product.stock !== undefined ? parseInt(product.stock) : 9999;
        if (maxAddQty <= 0) {
            console.warn(`Attempted to add Out of Stock item: ${product.name}`);
            return; // Block ghost additions entirely
        }

        setCart(prev => {
            // Enforce GLOBAL stock limit for this underlying variant regardless of differing gift options attached
            const currentTotalQty = prev.reduce((sum, item) => {
                if (item.id === product.id && item.selectedSize === size) {
                    return sum + item.quantity;
                }
                return sum;
            }, 0);

            if (currentTotalQty >= maxAddQty) return prev; // Absolutely blocked

            const allowedQuantityToAdd = Math.min(Number(quantity), maxAddQty - currentTotalQty);
            if (allowedQuantityToAdd <= 0) return prev;

            // Create a unique ID for the item based on ID + Size + Gift Option Name
            const existingItemIndex = prev.findIndex(item =>
                item.id === product.id &&
                item.selectedSize === size &&
                (item.giftOption?.name || '') === (giftOption?.name || '')
            );

            if (existingItemIndex > -1) {
                const newCart = [...prev];
                const currentItem = newCart[existingItemIndex];
                newCart[existingItemIndex] = {
                    ...currentItem,
                    quantity: currentItem.quantity + allowedQuantityToAdd
                };
                return newCart;
            }

            return [...prev, {
                id: product.id,
                name: product.name,
                image: product.image,
                selectedSize: size,
                price: price,
                quantity: allowedQuantityToAdd,
                giftOption: giftOption,
                stock: product.stock // Preserve stock limit
            }];
        });

        // Trigger Toast
        setToastMessage(`${product.name} has been added to your humidor.`);
        setTimeout(() => setToastMessage(null), 4000);

        setIsOpen(true); // Open mini-cart on add
    };

    const removeFromCart = (productId, size, giftOptionName = '') => {
        setCart(prev => prev.filter(item => !(item.id === productId && item.selectedSize === size && (item.giftOption?.name || '') === giftOptionName)));
    };

    const updateQuantity = (productId, size, delta, giftOptionName = '') => {
        setCart(prev => {
            const itemToUpdate = prev.find(item => item.id === productId && item.selectedSize === size && (item.giftOption?.name || '') === giftOptionName);
            if (!itemToUpdate) return prev;

            const maxQty = itemToUpdate.stock !== undefined ? parseInt(itemToUpdate.stock, 10) : 9999;

            // Evaluate global baseline of variants locked inside OTHER gift bundles
            const currentOtherTotalQty = prev.reduce((sum, item) => {
                if (item.id === productId && item.selectedSize === size && (item.giftOption?.name || '') !== giftOptionName) {
                    return sum + item.quantity;
                }
                return sum;
            }, 0);

            const allowedMaxForThisItem = maxQty - currentOtherTotalQty;
            const newQty = Math.min(allowedMaxForThisItem, Math.max(1, itemToUpdate.quantity + delta));

            return prev.map(item => {
                if (item.id === productId && item.selectedSize === size && (item.giftOption?.name || '') === giftOptionName) {
                    return { ...item, quantity: newQty };
                }
                return item;
            });
        });
    };

    const clearCart = () => setCart([]);

    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            cartTotal,
            cartSubtotal,
            discountAmount,
            promoCode,
            cartCount,
            isOpen,
            setIsOpen,
            clearCart
        }}>
            {children}

            {/* Global Slide-In Toast */}
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    background: 'rgba(18, 14, 13, 0.95)',
                    border: '1px solid var(--color-accent)',
                    color: '#fff',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                    zIndex: 9999,
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.95rem',
                    animation: 'slideInRight 0.4s ease-out, fadeOut 0.4s ease-out 3.6s forwards'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <span>{toastMessage}</span>
                    </div>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                    @keyframes slideInRight {from {transform: translateX(100%); opacity: 0; } to {transform: translateX(0); opacity: 1; } }
                    @keyframes fadeOut {from {opacity: 1; } to {opacity: 0; } }
                    `}} />
                </div>
            )}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
