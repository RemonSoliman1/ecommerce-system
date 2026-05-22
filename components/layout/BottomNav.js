'use client';

import { Link, usePathname } from '@/lib/navigation';
import { Home, ShoppingBag, User, Heart, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import styles from './BottomNav.module.css';
import { useTranslations } from 'next-intl';

export default function BottomNav() {
    const pathname = usePathname();
    const { cart } = useCart();
    const { wishlist } = useWishlist();
    const t = useTranslations('Header');

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const wishlistCount = wishlist.length;

    const navItems = [
        { label: 'Home', icon: Home, href: '/' },
        { label: 'Shop', icon: ShoppingBag, href: '/shop' },
        { label: 'Account', icon: User, href: '/account' },
        { label: 'Wishlist', icon: Heart, href: '/wishlist', badge: wishlistCount },
    ];

    return (
        <nav className={styles.bottomNav}>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname === `/ar${item.href}` || pathname === `/en${item.href}`;
                
                return (
                    <Link 
                        key={item.label} 
                        href={item.href} 
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <div className={styles.iconWrapper}>
                            <Icon size={24} />
                            {item.badge > 0 && (
                                <span className={styles.badge}>{item.badge}</span>
                            )}
                        </div>
                        <span className={styles.label}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
