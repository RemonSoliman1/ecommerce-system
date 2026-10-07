'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 3s
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {toasts.map(toast => (
                    <div key={toast.id} style={{
                        background: toast.type === 'error' ? '#d32f2f' : '#388e3c',
                        color: '#fff',
                        padding: '1rem 2rem',
                        borderRadius: '4px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        animation: 'slideIn 0.3s ease',
                        minWidth: '250px',
                        display: 'flex',
                        alignItems: 'center',
                        fontFamily: 'var(--font-sans)'
                    }}>
                        {toast.message}
                    </div>
                ))}
                <style jsx>{`
            @keyframes slideIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
          `}</style>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
