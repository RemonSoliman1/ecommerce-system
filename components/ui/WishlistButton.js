'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { useTour } from '@/context/TourContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/lib/navigation';
import styles from './WishlistButton.module.css';

export default function WishlistButton({ product, className = '' }) {
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { user } = useAuth();
    const { showToast } = useToast();
    const { isTourActive } = useTour();
    const router = useRouter();
    const isAdded = isInWishlist(product.id);

    return (
        <button
            className={`${styles.wishlistBtn} ${isAdded ? styles.added : ''} ${className} tour-wishlist-btn`}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isTourActive) return; // Prevent auth redirect during tour
                if (!user) {
                    showToast('Please Sign In to save to your Wishlist', 'error');
                    router.push('/login');
                    return;
                }
                toggleWishlist(product);
            }}
            aria-label={isAdded ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                size={20}
                fill={isAdded ? "var(--color-accent)" : "none"}
                color={isAdded ? "var(--color-accent)" : "currentColor"}
            />
        </button>
    );
}
