'use client';

import { useState } from 'react';
import styles from './FloatingChat.module.css';
import ContactModal from './ContactModal';
import { MessageCircle, PhoneCall } from 'lucide-react';

export default function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={styles.chatButton}
                aria-label="Contact Support"
            >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
                    <MessageCircle size={32} strokeWidth={1.5} style={{ position: 'absolute' }} />
                    <PhoneCall size={14} fill="currentColor" strokeWidth={0} style={{ position: 'absolute', transform: 'translateY(-1px)' }} />
                </div>
            </button>
            <ContactModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
