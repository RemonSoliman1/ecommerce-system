export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/account/'],
    },
    sitemap: 'https://cigar-lounge-one.vercel.app/sitemap.xml',
  }
}
