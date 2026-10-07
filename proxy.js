import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'ar'],

    // Used when no locale matches
    defaultLocale: 'en'
});

export const config = {
    // Simplified matcher to ensure API routes are definitely excluded
    matcher: ['/((?!api|_next|static|.*\\..*).*)']
};
