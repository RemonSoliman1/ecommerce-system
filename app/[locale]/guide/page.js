import styles from './guide.module.css';

export default function GuidePage() {
    return (
        <div className="container" style={{ padding: '2rem 0 6rem 0' }}>
            <div className={styles.hero}>
                <h1 className={styles.title}>The User Guide</h1>
                <p className={styles.subtitle}>Navigate our ecosystem with ease. Here is everything you need to know about our Telegram Bot and Web Platform.</p>
            </div>

            <div className={styles.content}>
                
                {/* TELEGRAM BOT GUIDE */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.icon}>🤖</span> 
                        The Telegram Bot Guide
                    </h2>
                    
                    <div className={styles.subSection}>
                        <h3>For First-Time Users (Welcome Aboard!)</h3>
                        <p style={{ color: '#aaa', marginBottom: '1rem' }}>Getting started with our automated lounge companion is effortless. Follow these steps to explore our collection:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <strong>Start the Bot:</strong> Open the chat and tap the Start button (or type <code>/start</code>). This initializes your profile and opens the main menu.
                            </li>
                            <li className={styles.listItem}>
                                <strong>Link Your Account:</strong> Tap the 🔗 Link Store Account button. The bot will securely request your phone number to automatically sync your past lounge purchases and active profile.
                            </li>
                            <li className={styles.listItem}>
                                <strong>Explore the Collection:</strong> Tap 🔥 Enter the Humidor to instantly browse our live stock of premium samplers, bundles, and cigarillos.
                            </li>
                            <li className={styles.listItem}>
                                <strong>Instant Brand Search:</strong> You don't need a menu to search. Simply type any brand name (e.g., Oliva, Plasencia, or Camacho) directly into the chat, and the bot will instantly reply with our current inventory.
                            </li>
                            <li className={styles.listItem}>
                                <strong>Call a Human:</strong> If you have a custom request or an issue, type <code>/chat</code>. The bot will instantly patch you through to a live lounge agent.
                            </li>
                        </ul>
                    </div>

                    <div className={styles.subSection}>
                        <h3>For Returning Users (Need Assistance?)</h3>
                        <p style={{ color: '#aaa', marginBottom: '1rem' }}>If you are already registered but things aren't working as expected, use these quick resets:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <strong>The Master Reset:</strong> If the bot stops responding or feels stuck, type <code>/start</code> at any time. This refreshes the core interface without losing your linked account data.
                            </li>
                            <li className={styles.listItem}>
                                <strong>Get Unstuck from Support:</strong> If you were speaking with a live agent and want to return to browsing products automatically, type <code>/end</code> to close the support ticket and bring back the search engine.
                            </li>
                            <li className={styles.listItem}>
                                <strong>View Commands:</strong> Tap the Menu button next to your chat box to see a clean list of all active shortcuts.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* WEBSITE GUIDE */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.icon}>🌐</span> 
                        The Website Guide
                    </h2>
                    
                    <div className={styles.subSection}>
                        <h3>For First-Time Users (Navigating the Digital Lounge)</h3>
                        <p style={{ color: '#aaa', marginBottom: '1rem' }}>Our web platform is designed to make catalog browsing and account management completely seamless:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <strong>Create an Account:</strong> Click Sign Up in the top right corner. Enter your email and choose a secure password.
                            </li>
                            <li className={styles.listItem}>
                                <strong>Complete Your Profile:</strong> Drop by your dashboard to save your preferences. Make sure to use the same mobile number you use on Telegram so your web profile and bot stay perfectly synced.
                            </li>
                            <li className={styles.listItem}>
                                <strong>The Visual Humidor:</strong> Head over to our catalog page. You can filter premium selections by singles, boxes, samplers, or size profiles (Vitolas).
                            </li>
                            <li className={styles.listItem}>
                                <strong>Secure Checkout:</strong> Add items to your cart and proceed to checkout. Your order history will instantly reflect across both the website and your Telegram app.
                            </li>
                        </ul>
                    </div>

                    <div className={styles.subSection}>
                        <h3>For Returning Users (Pro-Tips & Troubleshooting)</h3>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <strong>Sync Issues:</strong> If your web order history isn't showing up on your Telegram bot, verify that your phone number matches exactly on both platforms.
                            </li>
                            <li className={styles.listItem}>
                                <strong>Clearing the Cache:</strong> If product availability or images look outdated after a major stock update, simply log out, clear your browser cookies, and log back in to force a fresh pull from the database.
                            </li>
                            <li className={styles.listItem}>
                                <strong>Direct Web Support:</strong> If you prefer typing on a keyboard over your phone, the live chat widget on the bottom right of the website routes directly to the exact same support hub as our Telegram assistant.
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
