'use client';

import { LOYALTY_TIERS } from '@/context/LoyaltyContext';
import styles from './loyalty.module.css';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function LoyaltyPage() {
    const t = useTranslations('Loyalty');
    
    return (
        <div className="container">
            <div className={styles.header}>
                <h1>{t('title')}</h1>
                <p>{t('subtitle')}</p>
            </div>

            <div className={styles.tiersContainer}>
                {LOYALTY_TIERS.map((tier) => (
                    <div key={tier.name} className={`${styles.tierCard} ${styles[tier.name.toLowerCase()]}`}>
                        <div className={styles.tierHeader}>
                            <h2>{tier.name}</h2>
                            <p className={styles.pointsReq}>{tier.minPoints}+ {t('points')}</p>
                        </div>
                        <ul className={styles.benefitsList}>
                            {tier.benefits.map((benefit, index) => (
                                <li key={index}>
                                    <Check size={16} className={styles.icon} />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className={styles.faqSection}>
                <h2>{t('how_it_works')}</h2>
                <div className={styles.faqItem}>
                    <h3>{t('earning_title')}</h3>
                    <p>{t('earning_desc')}</p>
                </div>
                <div className={styles.faqItem}>
                    <h3>{t('expiration_title')}</h3>
                    <p>{t('expiration_desc')}</p>
                </div>
            </div>
        </div>
    );
}
