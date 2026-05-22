'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import usePWAInstall from '@/hooks/usePWAInstall';

import styles from '@/components/ui/AgeGate.module.css';

const PWAContext = createContext();

export function PWAProvider({ children }) {
    const pwa = usePWAInstall();
    const [showManualModal, setShowManualModal] = useState(false);
    const [showFirstLaunch, setShowFirstLaunch] = useState(false);

    useEffect(() => {
        const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (standalone && !localStorage.getItem('lounge_first_launch')) {
            setShowFirstLaunch(true);
        }
    }, []);

    const closeFirstLaunch = () => {
        localStorage.setItem('lounge_first_launch', 'true');
        setShowFirstLaunch(false);
    };

    return (
        <PWAContext.Provider value={{ ...pwa, showManualModal, setShowManualModal }}>
            {children}
            
            {/* iOS Visual Guide Overlay */}
            {pwa.showIOSGuide && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(18, 12, 10, 0.95)',
                    color: '#D4AF37',
                    padding: '20px',
                    borderRadius: '12px',
                    zIndex: 9999,
                    textAlign: 'center',
                    border: '1px solid #D4AF37',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    width: '90%',
                    maxWidth: '400px'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Install CigarLounge</h3>
                    <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#fff' }}>
                        To install this app on your iPhone:
                    </p>
                    <ol style={{ textAlign: 'left', color: '#fff', fontSize: '14px', marginBottom: '20px', paddingLeft: '20px' }}>
                        <li>Tap the <strong>Share</strong> button <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle'}}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg> at the bottom of Safari.</li>
                        <li>Scroll down and select <strong>"Add to Home Screen"</strong> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle'}}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>.</li>
                    </ol>
                    <button 
                        onClick={() => pwa.setShowIOSGuide(false)}
                        style={{
                            backgroundColor: '#D4AF37',
                            color: '#120C0A',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        Got it!
                    </button>
                    {/* Arrow pointing down */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-15px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '0',
                        height: '0',
                        borderLeft: '15px solid transparent',
                        borderRight: '15px solid transparent',
                        borderTop: '15px solid #D4AF37'
                    }}></div>
                </div>
            )}

            {/* Manual Installation Modal */}
            {showManualModal && (
                <div className={styles.overlay}>
                    <div className={styles.modal} style={{ position: 'relative' }}>
                        <button 
                            onClick={() => setShowManualModal(false)}
                            style={{
                                position: 'absolute', top: '10px', right: '15px',
                                background: 'none', border: 'none', color: '#D4AF37',
                                fontSize: '24px', cursor: 'pointer'
                            }}
                        >&times;</button>
                        <h2 className={styles.title} style={{ marginTop: 0 }}>Install Our App</h2>
                        <p className={styles.text} style={{ marginBottom: '1.5rem' }}>
                            Get the best experience by installing our app on your device.
                        </p>
                        
                        <div style={{ marginTop: '20px', textAlign: 'left' }}>
                            <h4 style={{ color: '#fff', marginBottom: '10px' }}>iOS (iPhone/iPad)</h4>
                            <p className={styles.subtext} style={{ fontSize: '14px', margin: 0, color: '#aaa' }}>1. Open in Safari<br/>2. Tap the Share icon at the bottom<br/>3. Tap "Add to Home Screen"</p>
                        </div>

                        <div style={{ marginTop: '20px', textAlign: 'left' }}>
                            <h4 style={{ color: '#fff', marginBottom: '10px' }}>Android</h4>
                            <p className={styles.subtext} style={{ fontSize: '14px', margin: 0, color: '#aaa' }}>1. Open in Chrome<br/>2. Tap the menu icon (3 dots) top right<br/>3. Tap "Install app" or "Add to Home screen"</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Android Installation Modal */}
            {pwa.showAndroidModal && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <img src="/favicon.png" alt="App Icon" style={{ width: '80px', height: '80px', border: '1px solid var(--color-accent)' }} />
                        </div>
                        
                        <h2 className={styles.title} style={{ marginBottom: '1rem' }}>
                            Install CigarLounge
                        </h2>
                        
                        <p className={styles.text}>
                            Enhance your experience with the CigarLounge App. Enjoy faster browsing, seamless shopping, and instant access to our premium collection.
                        </p>
                        
                        <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '12px', marginBottom: '2rem', border: '1px solid var(--color-accent)' }}>
                            <p className={styles.subtext} style={{ textAlign: 'left', color: '#ccc' }}>
                                <strong>IMPORTANT DEVICE NOTE:</strong><br/> Depending on your specific Android launcher settings, this app may be installed directly to your <strong>App Drawer / All Apps Menu</strong> instead of your Home Screen.<br/><br/>If it does not appear on your Home Screen automatically, simply open your App Drawer, search for "CigarLounge", and drag it to your Home Screen!
                            </p>
                        </div>

                        <div className={styles.actions}>
                            <button 
                                onClick={() => pwa.promptInstall()}
                                className={styles.btnConfirm}
                            >
                                Install App
                            </button>
                            <button 
                                onClick={() => pwa.setShowAndroidModal(false)}
                                className={styles.btnDeny}
                            >
                                Not Right Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Custom Android Installation Modal */}
            {pwa.showAndroidModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 10000, padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#120C0A',
                        padding: '30px',
                        borderRadius: '16px',
                        maxWidth: '450px',
                        width: '100%',
                        border: '1px solid #D4AF37',
                        textAlign: 'center',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.6)'
                    }}>
                        <div style={{ marginBottom: '20px' }}>
                            <img src="/favicon.png" alt="App Icon" style={{ width: '80px', height: '80px', borderRadius: '20%', border: '2px solid #D4AF37' }} />
                        </div>
                        
                        <h2 style={{ color: '#D4AF37', marginTop: 0, marginBottom: '10px', fontFamily: 'var(--font-serif)', fontSize: '24px' }}>
                            Install CigarLounge
                        </h2>
                        
                        <p style={{ color: '#fff', lineHeight: 1.6, marginBottom: '15px' }}>
                            Enhance your experience with the CigarLounge App. Enjoy faster browsing, seamless shopping, and instant access to our premium collection.
                        </p>
                        
                        <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '25px', borderLeft: '3px solid #D4AF37' }}>
                            <p style={{ color: '#aaa', fontSize: '13px', margin: 0, textAlign: 'left' }}>
                                <strong>Note:</strong> Depending on your device settings, the app may be placed silently in your <strong>App Drawer / App Menu</strong> instead of the Home Screen. You can search for "CigarLounge" in your apps!
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <button 
                                onClick={() => pwa.promptInstall()}
                                style={{
                                    backgroundColor: '#D4AF37',
                                    color: '#120C0A',
                                    border: 'none',
                                    padding: '14px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-sans)',
                                    textTransform: 'uppercase'
                                }}
                            >
                                Install App
                            </button>
                            <button 
                                onClick={() => pwa.setShowAndroidModal(false)}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#888',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                Not Right Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* App Installed Successfully Modal */}
            {pwa.showInstalledModal && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <img src="/favicon.png" alt="App Icon" style={{ width: '80px', height: '80px', border: '1px solid var(--color-accent)', borderRadius: '20%' }} />
                        </div>
                        
                        <h2 className={styles.title} style={{ marginBottom: '1rem', color: '#4BB543' }}>
                            Lounge App Installed Successfully!
                        </h2>
                        
                        <p className={styles.text} style={{ fontSize: '1.1rem' }}>
                            Look for our icon in your apps list. For the best experience, drag it to your Home Screen now.
                        </p>
                        
                        <div className={styles.actions}>
                            <button 
                                onClick={() => pwa.setShowInstalledModal(false)}
                                className={styles.btnConfirm}
                            >
                                Excellent
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* First-Launch Welcome Guide */}
            {showFirstLaunch && (
                <div className={styles.overlay}>
                    <div className={styles.modal} style={{ maxWidth: '550px' }}>
                        <h2 className={styles.title} style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>
                            Welcome to the Lounge!
                        </h2>
                        <h3 style={{ color: '#fff', fontWeight: 'normal', marginBottom: '2rem', fontFamily: 'var(--font-sans)', fontSize: '1.2rem' }}>
                            You are now using our dedicated App.
                        </h3>
                        
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #333' }}>
                            <p style={{ color: '#ccc', lineHeight: 1.6, margin: 0, textAlign: 'left' }}>
                                <strong>💡 Pro Tip for Android Users:</strong><br/><br/>
                                If you opened this from your App Drawer, we highly recommend adding us to your Home Screen.<br/><br/>
                                1. Open your device's <strong>App Drawer / Menu</strong>.<br/>
                                2. Search for <strong>CigarLounge</strong>.<br/>
                                3. <strong>Long-press</strong> our icon and drag it to your main Home Screen for instant access!
                            </p>
                        </div>

                        <div className={styles.actions}>
                            <button 
                                onClick={closeFirstLaunch}
                                className={styles.btnConfirm}
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PWAContext.Provider>
    );
}

export const usePWA = () => useContext(PWAContext);
