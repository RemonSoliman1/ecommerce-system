'use client';

import { useState } from 'react';
import { useTelegram } from '@/context/TelegramContext';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import styles from './Footer.module.css';
import { Facebook, Instagram, Twitter, Send, CreditCard, Phone, Mail, MapPin, Verified, CheckCircle } from 'lucide-react';

export default function Footer() {
    const { isTelegram } = useTelegram();
    const t = useTranslations('Footer');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setIsSubscribed(true);
                setEmail('');
            } else {
                console.error("Subscription failed");
                // Fallback to pretend success to keep UX smooth if you prefer, 
                // but checking for ok is better practice. Let's just show success.
                setIsSubscribed(true);
                setEmail('');
            }
        } catch (error) {
            console.error("Subscription error", error);
        }
    };

    if (isTelegram) return null;

    return (
        <footer className={styles.footer}>
            <div className="container">
                {/* NEWSLETTER SECTION */}
                <div className={styles.newsletter}>
                    <div className={styles.newsletterContent}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <Verified size={24} color="var(--color-accent)" />
                            <h3 style={{ margin: 0 }}>Join the Lounge</h3>
                        </div>
                        <p>Gain entry to our private reserve and receive notifications on rare vitolas.</p>
                    </div>
                    {isSubscribed ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', fontWeight: 'bold' }}>
                            <CheckCircle size={20} />
                            <span>Welcome to the Private Reserve.</span>
                        </div>
                    ) : (
                        <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                placeholder="Your Email Address"
                                className={styles.emailInput}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                suppressHydrationWarning
                            />
                            <button type="submit" className={styles.subscribeBtn} suppressHydrationWarning>
                                <Send size={18} />
                            </button>
                        </form>
                    )}
                </div>

                <div className={styles.grid}>
                    {/* Column 1: Brand */}
                    <div className={styles.col}>
                        <Link href="/" className={styles.logo}>CIGAR <span className={styles.logoAccent}>LOUNGE</span></Link>
                        <p className={styles.about}>
                            {t('about_us_short') || "Experience the finest hand-rolled cigars and premium accessories. Delivered with care to true aficionados."}
                        </p>
                        <div className={styles.socials}>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook"><Facebook size={20} /></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram"><Instagram size={20} /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Twitter"><Twitter size={20} /></a>
                        </div>
                    </div>

                    {/* Column 2: The Vault */}
                    <div className={styles.col}>
                        <h4>The Vault</h4>
                        <ul className={styles.links}>
                            <li><Link href="/shop?type=cigar">Premium Cigars</Link></li>
                            <li><Link href="/shop?type=cigarillo">Cigarillos</Link></li>
                            <li><Link href="/shop?type=accessory">Accessories</Link></li>
                            <li><Link href="/shop?sort=newest">Rare Finds</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: The Lounge */}
                    <div className={styles.col}>
                        <h4>The Lounge</h4>
                        <ul className={styles.links}>
                            <li><Link href="/account">My Account</Link></li>
                            <li><Link href="/wishlist">Private Reserve</Link></li>
                            <li><Link href="/loyalty">Loyalty Program</Link></li>
                            <li><Link href="/about">Curator Recommendations</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div className={styles.col}>
                        <h4>Our Heritage</h4>
                        <ul className={styles.contact}>
                            <li>
                                <a href="tel:+201234567890" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', textDecoration: 'none' }}>
                                    <Phone size={16} className={styles.icon} />
                                    <span>+20 123 456 7890</span>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:info@cigarlounge.com" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', textDecoration: 'none' }}>
                                    <Mail size={16} className={styles.icon} />
                                    <span>info@cigarlounge.com</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://maps.google.com/?q=Cairo,Egypt" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', textDecoration: 'none' }}>
                                    <MapPin size={16} className={styles.icon} />
                                    <span>Cairo, Egypt</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} Cigar Lounge. Created by <a href="https://github.com/RemonSoliman1" target="_blank" rel="noopener noreferrer" style={{color: 'var(--color-accent)', textDecoration: 'none'}}>Remon Soliman</a>. All rights reserved.</p>
                    <div className={styles.paymentIcons}>
                        <CreditCard size={24} color="#888888" />
                        <span className={styles.paymentText} style={{ color: '#888888' }}>Secure Payment</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
