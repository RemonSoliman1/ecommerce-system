import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { LoyaltyProvider } from '@/context/LoyaltyContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import AgeGate from '@/components/ui/AgeGate';
import ResetAgeGate from '@/components/ui/ResetAgeGate';
import FloatingChat from '@/components/ui/FloatingChat';
import ScrollToTop from '@/components/ui/ScrollToTop';
import TelegramBackButton from '@/components/ui/TelegramBackButton';
import { Playfair_Display, Montserrat, Allura } from 'next/font/google';
import { TelegramProvider } from '@/context/TelegramContext';
import { ProductProvider } from '@/context/ProductContext';

import { PWAProvider } from '@/context/PWAContext';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-sans',
});

const allura = Allura({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script',
});

export const metadata = {
  title: 'CigarLounge - Premium Cigars & Accessories',
  description: 'The finest selection of hand-rolled cigars and luxury accessories.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'CigarLounge',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </head>
      <body className={`${playfair.variable} ${montserrat.variable} ${allura.variable}`} suppressHydrationWarning={true}>
        <NextIntlClientProvider messages={messages}>
          <TelegramProvider>
            <PWAProvider>
              <ToastProvider>
                <AuthProvider>
                  <LoyaltyProvider>
                  <ProductProvider>
                    <CartProvider>
                      <WishlistProvider>
                        <AgeGate />
                        <Header />
                        {children}
                        <FloatingChat />
                        <ScrollToTop />
                        <TelegramBackButton />
                        <Footer />
                        <BottomNav />
                      </WishlistProvider>
                    </CartProvider>
                  </ProductProvider>
                </LoyaltyProvider>
              </AuthProvider>
            </ToastProvider>
            </PWAProvider>
          </TelegramProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
