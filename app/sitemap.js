import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function sitemap() {
  const baseUrl = 'https://cigar-lounge-one.vercel.app';
  
  // Static routes
  const staticRoutes = ['', '/shop', '/about', '/help', '/policy', '/guide'].map((route) => ({
    url: `${baseUrl}/en${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  let productRoutes = [];
  
  if (supabaseAdmin) {
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, updated_at');
      
    if (products) {
      productRoutes = products.map((product) => ({
        url: `${baseUrl}/en/product/${product.id}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      }));
    }
  }

  return [...staticRoutes, ...productRoutes];
}
