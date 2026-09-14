'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './help.module.css';
import { ChevronDown, ChevronUp, MessageSquare, Phone, Mail } from 'lucide-react';

export default function HelpPage() {
    const t = useTranslations('Help');
    const [openItem, setOpenItem] = useState(null);

    const toggleItem = (index) => {
        setOpenItem(openItem === index ? null : index);
    };

    const faqs = [
        {
            question: "How do I change my username or password?",
            answer: "To change your username or password, go to the 'My Account' page. Click on the 'Settings' tab in the sidebar. There you will find options to update your profile information and change your password."
        },
        {
            question: "What is your shipping policy?",
            answer: "We offer expedited shipping on all orders to ensure your cigars arrive in perfect condition. Orders placed before 2 PM local time are processed the same day. You can track your order status in the 'Orders' tab of your account."
        },
        {
            question: "What is your returns policy?",
            answer: "We guarantee the quality of our cigars. If you are not satisfied with your purchase, you may return the unsmoked cigars within 14 days of delivery for a full refund or exchange. Please contact our support team to initiate a return."
        },
        {
            question: "How does the Loyalty Program work?",
            answer: "You earn points for every purchase you make. These points can be redeemed for exclusive discounts and rewards. You can view your points balance and current tier in the 'Overview' tab of your account."
        },
        {
            question: "How can I trigger the interactive tour again?",
            answer: "If you want to view the guided tours again, go to the 'My Account' page and click on the 'Interactive Guide' tab. There you will find a button to reset all tours."
        }
    ];

    return (
        <div className="container">
            <div className={styles.header}>
                <h1>{t('title') || 'Help & FAQ'}</h1>
                <p className={styles.subtitle}>{t('subtitle') || 'Find answers to common questions or reach out to our support team.'}</p>
            </div>

            <div className={styles.content}>
                <div className={styles.faqSection}>
                    <h2>Frequently Asked Questions</h2>
                    <div className={styles.accordion}>
                        {faqs.map((faq, index) => (
                            <div key={index} className={`${styles.accordionItem} ${openItem === index ? styles.open : ''}`}>
                                <button className={styles.accordionHeader} onClick={() => toggleItem(index)}>
                                    <span>{faq.question}</span>
                                    {openItem === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                <div className={styles.accordionBody}>
                                    <div className={styles.accordionContent}>
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.contactSection}>
                    <h2>Contact Us</h2>
                    <p>Still need help? Our concierge team is ready to assist you.</p>
                    
                    <div className={styles.contactCards}>
                        <div className={styles.contactCard}>
                            <MessageSquare size={32} color="var(--color-accent)" />
                            <h3>Live Chat</h3>
                            <p>Available 24/7 on Telegram</p>
                            <a href="https://t.me/CigarLoungeBot" target="_blank" rel="noopener noreferrer" className="btn">Chat Now</a>
                        </div>
                        <div className={styles.contactCard}>
                            <Phone size={32} color="var(--color-accent)" />
                            <h3>Phone Support</h3>
                            <p>Mon-Fri, 9am - 6pm</p>
                            <a href="tel:+1234567890" className="btn-outline">Call Us</a>
                        </div>
                        <div className={styles.contactCard}>
                            <Mail size={32} color="var(--color-accent)" />
                            <h3>Email Us</h3>
                            <p>We typically reply within 24 hours</p>
                            <a href="mailto:support@cigarlounge.com" className="btn-outline">Send Email</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
