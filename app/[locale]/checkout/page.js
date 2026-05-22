'use client';

import { startTransition, useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useToast } from '@/context/ToastContext';
import styles from './checkout.module.css';
import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { useTelegram } from '@/context/TelegramContext';
import { Lock, CreditCard, Banknote, Smartphone, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
    const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
    const { refreshProducts } = useProducts();
    const { user } = useAuth();
    const { user: tgUser, isTelegram, webApp } = useTelegram(); // Get TG user
    const { showToast } = useToast();
    const [step, setStep] = useState(1); // 1: Cart, 2: Details, 3: Success
    const [shippingCost, setShippingCost] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastOrder, setLastOrder] = useState(null); // Valid receipt state
    const t = useTranslations('Checkout');
    const tCart = useTranslations('Cart');

    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [promoError, setPromoError] = useState('');
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setIsValidatingPromo(true);
        setPromoError('');
        try {
            const res = await fetch('/api/promotions/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    code: promoCode,
                    cart: cart,
                    cartTotal: cartTotal,
                    email: address.email || user?.email,
                    paymentMethod: paymentMethod
                })
            });
            const data = await res.json();
            if (data.success && data.promo) {
                setAppliedPromo(data.promo);
                setDiscountAmount(data.discountAmount);
                showToast(`Promo ${data.promo.code} applied!`, 'success');
            } else {
                setPromoError(data.error || 'Invalid promo code');
            }
        } catch (e) {
            setPromoError('Failed to validate promo');
        }
        setIsValidatingPromo(false);
    };

    // Auto-apply promo from Product Page
    useEffect(() => {
        const pendingPromo = localStorage.getItem('pending_promo_code');
        if (pendingPromo && cartTotal > 0) {
            setPromoCode(pendingPromo);
            // We can't immediately call handleApplyPromo because it relies on state that might not be fully synced in the closure,
            // but since cartTotal is a prop/context it should be fine. However, we need to pass the code directly.
            const applyPending = async () => {
                setIsValidatingPromo(true);
                try {
                    const res = await fetch('/api/promotions/validate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            code: pendingPromo,
                            cart: cart,
                            cartTotal: cartTotal,
                            email: address.email || user?.email,
                            paymentMethod: paymentMethod
                        })
                    });
                    const data = await res.json();
                    if (data.success && data.promo) {
                        setAppliedPromo(data.promo);
                        setDiscountAmount(data.discountAmount);
                        showToast(`Promo ${data.promo.code} applied!`, 'success');
                        localStorage.removeItem('pending_promo_code');
                    }
                } catch (e) {
                    // Ignore errors on auto-apply
                }
                setIsValidatingPromo(false);
            };
            applyPending();
        }
    }, [cartTotal, cart.length, user]);

    // Transfer States (InstaPay/Vodafone)
    const [transferRef, setTransferRef] = useState('');
    const [receiptUrl, setReceiptUrl] = useState('');
    const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingReceipt(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/admin/upload-image', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error || "Upload failed");

            setReceiptUrl(data.url);
            showToast("Receipt uploaded successfully", 'success');
        } catch (error) {
            console.error("Receipt upload error:", error);
            showToast("Failed to upload receipt", 'error');
        } finally {
            setIsUploadingReceipt(false);
        }
    };

    // Address State
    const [address, setAddress] = useState({
        name: '',
        street: '',
        city: '',
        phone: '',
        email: ''
    });

    // Pre-fill user data (auth or telegram)
    useEffect(() => {
        if (user) {
            setAddress(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        } else if (tgUser) {
            // Fallback to Telegram info if not full auth
            setAddress(prev => ({
                ...prev,
                name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || tgUser.username || '',
                // Telegram doesn't provide email by default, so we leave it empty
            }));
        }
    }, [user, tgUser]);

    const [paymentMethod, setPaymentMethod] = useState('card');

    // Dummy Card State
    const [cardInfo, setCardInfo] = useState({
        number: '',
        expiry: '',
        cvc: ''
    });

    // Validation Helpers
    const formatCardNumber = (val) => {
        return val.replace(/\D/g, '').substring(0, 16);
    };

    const formatExpiry = (val) => {
        const clean = val.replace(/\D/g, '');
        if (clean.length >= 2) {
            return clean.substring(0, 2) + '/' + clean.substring(2, 4);
        }
        return clean;
    };

    // Handlers
    const handleCardChange = (e) => {
        setCardInfo({ ...cardInfo, number: formatCardNumber(e.target.value) });
    };

    const handleExpiryChange = (e) => {
        setCardInfo({ ...cardInfo, expiry: formatExpiry(e.target.value) });
    };

    // Simple validation check
    const canProceedToPayment = address.name && address.street && address.city && address.phone && address.email;

    const handleCalculateShipping = () => {
        if (!canProceedToPayment) {
            alert("Please fill in all address fields.");
            return;
        }
        // Mock shipping
        const cost = address.city.toLowerCase().includes('cairo') ? 50 : 100;
        setShippingCost(cost);
        setStep(2); // Move to Payment/Confirm
    };

    // State for validation errors
    const [fieldErrors, setFieldErrors] = useState({});

    // Luhn Algorithm Check
    const isValidLuhn = (val) => {
        let sum = 0;
        let shouldDouble = false;
        // loop backwards
        for (let i = val.length - 1; i >= 0; i--) {
            let digit = parseInt(val.charAt(i));

            if (shouldDouble) {
                if ((digit *= 2) > 9) digit -= 9;
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return (sum % 10) === 0;
    };

    const [saveInfo, setSaveInfo] = useState(false);

    // Logic to load saved info
    useEffect(() => {
        const saved = localStorage.getItem('cigar_user_info');
        if (saved) {
            const parsed = JSON.parse(saved);
            setAddress(prev => ({ ...prev, ...parsed }));
            setSaveInfo(true);
        }
    }, []);

    // ... (existing helper functions)

    const handlePlaceOrder = async () => {
        // ... (validation logic same as before)
        setFieldErrors({}); // Reset errors
        const errors = {};

        if (paymentMethod === 'card') {
            if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvc) {
                showToast("Please enter dummy card details.", 'error');
                return;
            }

            // Validate Card Number (Length & Luhn)
            const cleanNumber = cardInfo.number.replace(/\D/g, '');
            if (cleanNumber.length !== 16) {
                errors.number = "Card must be 16 digits.";
            } else if (!isValidLuhn(cleanNumber)) {
                errors.number = "Invalid card number (Luhn check failed).";
            }

            // Validate CVC
            if (cardInfo.cvc.length < 3) {
                errors.cvc = "Invalid CVC.";
            }

            // Date Validation
            const [expMonth, expYear] = cardInfo.expiry.split('/');
            if (!expMonth || !expYear) {
                errors.expiry = "Use MM/YY format.";
            } else {
                const currentYear = new Date().getFullYear() % 100; // Last 2 digits
                const inputMonth = parseInt(expMonth, 10);
                const inputYear = parseInt(expYear, 10);

                if (inputMonth < 1 || inputMonth > 12) {
                    errors.expiry = "Invalid Month (01-12).";
                } else if (inputYear < currentYear || (inputYear === currentYear && inputMonth < new Date().getMonth() + 1)) {
                    errors.expiry = "Card has expired.";
                }
            }

            // If there are errors, set state and stop
            if (Object.keys(errors).length > 0) {
                setFieldErrors(errors);
                showToast("Please fix the card errors highlighted below.", 'error');
                return;
            }
        }

        if (saveInfo) {
            localStorage.setItem('cigar_user_info', JSON.stringify({
                name: address.name,
                phone: address.phone,
                email: address.email,
                city: address.city,
                street: address.street
            }));
        } else {
            localStorage.removeItem('cigar_user_info');
        }

        setIsProcessing(true);

        try {
            // SAVE ORDER HISTORY (Optimistic or wait for DB? Let's wait for DB ID)
            const tempId = Math.floor(Math.random() * 100000);

            // FORMAT PAYMENT DETAILS
            let finalPaymentMethod = paymentMethod;
            if (paymentMethod === 'instapay' || paymentMethod === 'vodafone') {
                if (transferRef) finalPaymentMethod += ` | REF:${transferRef}`;
                if (receiptUrl) finalPaymentMethod += ` | IMG:${receiptUrl}`;
            }

            // TRIGGER ORDER CREATION & NOTIFICATION
            const refinedOrder = {
                orderId: tempId,
                items: cart,
                total: Math.max(0, cartTotal - discountAmount) + shippingCost,
                discount: discountAmount,
                promoCode: appliedPromo?.code || null,
                customer: address,
                paymentMethod: finalPaymentMethod,
                telegramChatId: tgUser?.id || null
            };

            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(refinedOrder)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to place order');
            }

            // Success!
            const finalOrder = {
                ...refinedOrder,
                id: data.dbOrderId || tempId,
                date: new Date().toISOString(),
                status: 'Pending',
                userEmail: user ? user.email : address.email,
                contactEmail: address.email
            };

            // Save to local history
            const history = JSON.parse(localStorage.getItem('cigar_orders') || '[]');
            history.unshift(finalOrder);
            localStorage.setItem('cigar_orders', JSON.stringify(history));

            // Fix Receipt: Save order detail to state before clearing cart
            setLastOrder(finalOrder);

            setIsProcessing(false);
            clearCart(); // Now safe to clear
            refreshProducts(); // Blast the Global caching context to synchronize inventory with Supabase Backend
            setStep(3); // Success

        } catch (error) {
            console.error("Order creation failed", error);
            showToast(error.message || "Failed to place order. Please try again.", 'error');
            setIsProcessing(false);
        }
    };

    if (step === 3) {
        // ... (Success UI same as before)
        return (
            <div className="container" style={{ padding: '6rem 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ color: 'var(--color-accent)', fontSize: '3rem', marginBottom: '1rem' }}>{t('confirmed')}</h1>
                    <p style={{ fontSize: '1.2rem' }}>{t('thank_you')}, {address.name}.</p>
                </div>

                {/* Mock Email Receipt */}
                <div style={{
                    background: '#fff',
                    color: '#333',
                    padding: '2rem',
                    maxWidth: '600px',
                    margin: '0 auto',
                    borderRadius: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    fontFamily: 'monospace'
                }}>
                    <div style={{ borderBottom: '1px solid #ccc', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                        <strong>FROM: CigarLounge</strong>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <strong>TO: {address.email}</strong>
                    </div>
                    <h3>RECEIPT #23942-CL</h3>
                    <p style={{ marginBottom: '1rem' }}>Payment Method: {paymentMethod === 'cod' ? t('cod') : `${t('card')} (**** 1234)`}</p>

                    <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #000' }}>
                                <th style={{ textAlign: 'start', padding: '0.5rem 0' }}>{t('receipt_item')}</th>
                                <th style={{ textAlign: 'end', padding: '0.5rem 0' }}>{t('receipt_price')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(lastOrder?.items || []).map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.5rem 0' }}>
                                        {item.name} <br />
                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{item.selectedSize} x {item.quantity}</span>
                                    </td>
                                    <td style={{ textAlign: 'end' }}>EGP {(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ textAlign: 'end', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        Total: EGP {(lastOrder?.total || 0).toFixed(2)}
                    </div>

                    <div style={{ marginTop: '2rem', textAlign: 'center', color: '#888', fontSize: '0.8rem' }}>
                        * This is a confirmation of your order. You will be notified when it ships.
                    </div>
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <Link href="/" className="btn">{t('return')}</Link>
                    <Link href="/shop" className="btn-outline" style={{ marginInlineStart: '1rem' }}>{tCart('continue_shopping')}</Link>
                </div>
            </div>
        );
    }

    if (cart.length === 0 && step !== 3) {
        return (
            <div className="container" style={{ padding: '8rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(197, 163, 92, 0.2)' }}>
                    <ShieldCheck size={40} color="var(--color-accent)" />
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-text-primary)', marginBottom: '1.5rem' }}>Your Humidor is Empty</h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '500px', lineHeight: '1.6' }}>Our humidor doesn't seem to have any vitolas currently selected. Would you like a personal recommendation from our curator?</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/shop" className="btn" style={{ background: 'var(--color-accent)', color: '#120C0A', border: 'none', fontWeight: 'bold' }}>{tCart('continue_shopping')}</Link>
                    <a href="mailto:curator@cigarlounge.com" className="btn-outline" style={{ borderColor: 'transparent', color: 'var(--color-text-primary)' }}>Contact Curator</a>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className={styles.layout}>
                {/* Left: Input Areas */}
                <div className={styles.main}>
                    <h1 className={styles.pageTitle}>{t('title')}</h1>

                    {/* Section 1: Review Items */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>{t('review')}</h2>
                        </div>
                        {/* ... items loop ... */}
                        <div className={styles.cartItems}>
                            {cart.map((item, idx) => (
                                <div key={`${item.id}-${item.selectedSize}-${idx}`} className={styles.cartItem}>
                                    <Link href={`/product/${item.id}`} className={styles.thumb}>
                                        {/* Improved placeholder with First Letter */}
                                        <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '0.7rem', overflow: 'hidden' }}>
                                            {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : item.name.substring(0, 3)}
                                        </div>
                                    </Link>
                                    <div className={styles.itemInfo}>
                                        <Link href={`/product/${item.id}`}><h4>{item.name}</h4></Link>
                                        <span className={styles.meta}>{item.selectedSize}</span>
                                    </div>
                                    <div className={styles.quant}>
                                        <button onClick={() => updateQuantity(item.id, item.selectedSize, -1, item.giftOption?.name)} disabled={item.quantity <= 1}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.selectedSize, 1, item.giftOption?.name)} disabled={item.quantity >= (item.stock !== undefined ? parseInt(item.stock, 10) : 9999)}>+</button>
                                    </div>
                                    <div className={styles.itemPrice}>
                                        EGP {(item.price * item.quantity).toFixed(2)}
                                    </div>
                                    <button onClick={() => removeFromCart(item.id, item.selectedSize, item.giftOption?.name)} className={styles.del}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 2: Address & Shipping */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>{t('shipping')}</h2>
                        </div>

                        <div className={styles.form}>
                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>{t('name')}</label>
                                    <input type="text" value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} placeholder="John Doe" className={fieldErrors.name ? styles.inputError : ''} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>{t('phone')}</label>
                                    <input type="text" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="+20..." className={fieldErrors.phone ? styles.inputError : ''} />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>{t('email')}</label>
                                <input type="email" value={address.email} onChange={e => setAddress({ ...address, email: e.target.value })} placeholder="john@example.com" className={fieldErrors.email ? styles.inputError : ''} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>{t('street')}</label>
                                <input type="text" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="123 Example St" className={fieldErrors.street ? styles.inputError : ''} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>{t('city')}</label>
                                <input type="text" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="Cairo" className={fieldErrors.city ? styles.inputError : ''} />
                            </div>
                            {/* Remember Me Checkbox */}
                            <div className={styles.inputGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '1rem' }}>
                                <input
                                    type="checkbox"
                                    id="saveInfo"
                                    checked={saveInfo}
                                    onChange={(e) => setSaveInfo(e.target.checked)}
                                    style={{ width: 'auto', margin: 0 }}
                                />
                                <label htmlFor="saveInfo" style={{ margin: 0, cursor: 'pointer' }}>{t('save_info')}</label>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Payment */}
                    <div className={`${styles.section} ${!canProceedToPayment ? styles.disabled : ''}`}>
                        {/* ... payment methods ... */}
                        <div className={styles.sectionHeader}>
                            <h2>{t('payment')}</h2>
                        </div>
                        <div className={styles.payment}>
                            <div className={styles.paymentMethods}>
                                <label className={`${styles.pMethod} ${paymentMethod === 'card' ? styles.activeMethod : ''}`}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <CreditCard size={20} style={{ color: paymentMethod === 'card' ? 'var(--color-accent)' : '#888' }} />
                                        <span>{t('card')}</span>
                                    </div>
                                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} disabled={!canProceedToPayment} />
                                </label>

                                {paymentMethod === 'card' && (
                                    <div className={styles.cardInputs}>
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <input type="text" placeholder="Card Number (16 digits)" value={cardInfo.number} onChange={handleCardChange} maxLength={16}
                                                style={{ border: fieldErrors.number ? '1px solid red' : '' }}
                                            />
                                            {fieldErrors.number && <span style={{ color: 'red', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>{fieldErrors.number}</span>}
                                        </div>
                                        <div className={styles.cardRow}>
                                            <div style={{ flex: 1 }}>
                                                <input type="text" placeholder="MM/YY" value={cardInfo.expiry} onChange={handleExpiryChange} maxLength={5}
                                                    style={{ border: fieldErrors.expiry ? '1px solid red' : '', width: '100%' }}
                                                />
                                                {fieldErrors.expiry && <span style={{ color: 'red', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>{fieldErrors.expiry}</span>}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <input type="text" placeholder={t('cvc')} value={cardInfo.cvc} onChange={e => setCardInfo({ ...cardInfo, cvc: e.target.value })} maxLength={4}
                                                    style={{ border: fieldErrors.cvc ? '1px solid red' : '', width: '100%' }}
                                                />
                                                {fieldErrors.cvc && <span style={{ color: 'red', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>{fieldErrors.cvc}</span>}
                                            </div>
                                        </div>
                                        {/* Save Payment Details Checkbox */}
                                        <div className={styles.inputGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', marginBottom: 0 }}>
                                            <input
                                                type="checkbox"
                                                id="savePaymentInfo"
                                                style={{ width: 'auto', margin: 0, cursor: 'pointer', transform: 'scale(1.1)' }}
                                            />
                                            <label htmlFor="savePaymentInfo" style={{ margin: 0, cursor: 'pointer', fontSize: '0.85rem', color: '#ccc' }}>
                                                {t('save_payment_info') || 'Save payment details for future purchases'}
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <label className={`${styles.pMethod} ${paymentMethod === 'cod' ? styles.activeMethod : ''}`}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <Banknote size={20} style={{ color: paymentMethod === 'cod' ? 'var(--color-accent)' : '#888' }} />
                                        <span>{t('cod')}</span>
                                    </div>
                                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} disabled={!canProceedToPayment} />
                                </label>

                                <label className={`${styles.pMethod} ${paymentMethod === 'instapay' ? styles.activeMethod : ''}`}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <Smartphone size={20} style={{ color: paymentMethod === 'instapay' ? 'var(--color-accent)' : '#888' }} />
                                        <span>{t('instapay')}</span>
                                    </div>
                                    <input type="radio" name="payment" value="instapay" checked={paymentMethod === 'instapay'} onChange={() => setPaymentMethod('instapay')} disabled={!canProceedToPayment} />
                                </label>

                                {paymentMethod === 'instapay' && (
                                    <div className={styles.cardInputs} style={{ marginTop: '0.5rem', marginBottom: '1rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: '#ccc', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: t('transfer_instructions', { method: t('instapay') }) }}>
                                        </p>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#888' }}>{t('upload_receipt')}</label>
                                            <div style={{ position: 'relative', display: 'inline-block', border: '1px solid var(--color-accent)', padding: '0.8rem 1.5rem', borderRadius: '4px', background: 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'center', overflow: 'hidden', width: '100%', transition: 'all 0.3s ease' }}>
                                                <span style={{ pointerEvents: 'none', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px' }}>[ 📁 UPLOAD RECEIPT ]</span>
                                                <input type="file" accept="image/*" onChange={handleReceiptUpload}
                                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                                />
                                            </div>
                                            {isUploadingReceipt && <span style={{ fontSize: '0.85rem', color: 'var(--color-accent)', display: 'block', marginTop: '0.5rem' }}>{t('uploading_receipt')}</span>}
                                            {receiptUrl && <span style={{ fontSize: '0.85rem', color: '#00ff00', display: 'block', marginTop: '0.5rem' }}>{t('receipt_uploaded')}</span>}
                                        </div>
                                    </div>
                                )}

                                <label className={`${styles.pMethod} ${paymentMethod === 'vodafone' ? styles.activeMethod : ''}`}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <Smartphone size={20} style={{ color: paymentMethod === 'vodafone' ? 'var(--color-accent)' : '#888' }} />
                                        <span>{t('vodafone_cash')}</span>
                                    </div>
                                    <input type="radio" name="payment" value="vodafone" checked={paymentMethod === 'vodafone'} onChange={() => setPaymentMethod('vodafone')} disabled={!canProceedToPayment} />
                                </label>

                                {paymentMethod === 'vodafone' && (
                                    <div className={styles.cardInputs} style={{ marginTop: '0.5rem', marginBottom: '1rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: '#ccc', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: t('transfer_instructions', { method: t('vodafone_cash') }) }}>
                                        </p>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#888' }}>{t('upload_receipt')}</label>
                                            <div style={{ position: 'relative', display: 'inline-block', border: '1px solid var(--color-accent)', padding: '0.8rem 1.5rem', borderRadius: '4px', background: 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'center', overflow: 'hidden', width: '100%', transition: 'all 0.3s ease' }}>
                                                <span style={{ pointerEvents: 'none', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px' }}>[ 📁 UPLOAD RECEIPT ]</span>
                                                <input type="file" accept="image/*" onChange={handleReceiptUpload}
                                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                                />
                                            </div>
                                            {isUploadingReceipt && <span style={{ fontSize: '0.85rem', color: 'var(--color-accent)', display: 'block', marginTop: '0.5rem' }}>{t('uploading_receipt')}</span>}
                                            {receiptUrl && <span style={{ fontSize: '0.85rem', color: '#00ff00', display: 'block', marginTop: '0.5rem' }}>{t('receipt_uploaded')}</span>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Restriction Warning */}
                            {appliedPromo && appliedPromo.rule_payment_methods && (
                                (() => {
                                    const allowed = appliedPromo.rule_payment_methods.split(',').map(m => m.trim().toLowerCase());
                                    const baseMethod = paymentMethod.split(' ')[0].toLowerCase().replace(' |', '');
                                    if (!allowed.includes(baseMethod)) {
                                        return (
                                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,0,0,0.1)', border: '1px solid red', borderRadius: '4px', color: '#ffcccc', fontSize: '0.9rem' }}>
                                                ⚠️ <strong>Promo Note:</strong> The applied promo code ({appliedPromo.code}) is intended for <strong>{appliedPromo.rule_payment_methods.toUpperCase()}</strong> payments.
                                            </div>
                                        );
                                    }
                                    return null;
                                })()
                            )}

                            {/* Inline Mobile Place Order Button */}
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    className="btn"
                                    style={{ padding: '15px 30px', fontSize: '1.1rem' }}
                                    onClick={handlePlaceOrder}
                                    disabled={!canProceedToPayment || isProcessing}
                                >
                                    {isProcessing ? t('processing') : t('place_order')}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right: Summary */}
                <div className={styles.summary}>
                    <div className={styles.summaryCard}>
                        <h3>{t('summary')}</h3>
                        <div className={styles.summaryRow}>
                            <span>{t('subtotal')}</span>
                            <span>EGP {cartTotal.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>{t('shipping_est')}</span>
                            <span>
                                {!address.city ? 'Enter City' :
                                    (address.city.toLowerCase().includes('cairo') ? 'EGP 50.00' : 'EGP 100.00')}
                            </span>
                        </div>
                        
                        {/* Promo Code Box */}
                        <div style={{ marginTop: '1rem', marginBottom: '1rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input 
                                    type="text" 
                                    placeholder="Promo Code" 
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    style={{ flex: 1, padding: '0.5rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', textTransform: 'uppercase' }}
                                />
                                <button 
                                    onClick={handleApplyPromo}
                                    disabled={isValidatingPromo || !promoCode}
                                    style={{ padding: '0.5rem 1rem', background: 'var(--color-bg-secondary)', color: 'var(--color-accent)', border: '1px solid var(--color-accent)', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    {isValidatingPromo ? '...' : 'Apply'}
                                </button>
                            </div>
                            {promoError && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem' }}>{promoError}</div>}
                            {appliedPromo && (
                                <div style={{ color: '#00ff00', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Applied: {appliedPromo.code}</span>
                                    <button onClick={() => { setAppliedPromo(null); setDiscountAmount(0); setPromoCode(''); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                                </div>
                            )}
                        </div>

                        {discountAmount > 0 && (
                            <div className={styles.summaryRow} style={{ color: '#00ff00' }}>
                                <span>Discount ({appliedPromo?.code})</span>
                                <span>- EGP {discountAmount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className={styles.totalRow}>
                            <span>{t('total')}</span>
                            <span>
                                {!address.city ?
                                    `EGP ${Math.max(0, cartTotal - discountAmount).toFixed(2)} + Ship` :
                                    `EGP ${(Math.max(0, cartTotal - discountAmount) + (address.city.toLowerCase().includes('cairo') ? 50 : 100)).toFixed(2)}`}
                            </span>
                        </div>

                        <button
                            className="btn"
                            style={{ width: '100%', marginTop: '1.5rem', background: 'var(--color-accent)', color: '#120C0A', border: 'none', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}
                            onClick={handlePlaceOrder}
                            disabled={!canProceedToPayment || isProcessing}
                        >
                            {isProcessing ? t('processing') : t('place_order')}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '1rem', color: '#888', fontSize: '0.8rem' }}>
                            <Lock size={14} color="var(--color-accent)" style={{ opacity: 0.8 }} /> All transactions are encrypted and secure.
                        </div>

                        {!canProceedToPayment && <p style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', marginTop: '1rem' }}>Fill address details to enable payment.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
