import { supabaseAdmin } from '@/lib/supabaseAdmin';
import ProductClient from './ProductClient';

export async function generateMetadata({ params }) {
  const { id, locale } = await params;
  
  if (!supabaseAdmin) return {};
  
  const decodedId = decodeURIComponent(id);
  
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', decodedId)
    .single();

  if (!product) return {};

  const name = product.name || 'CigarLounge Product';
  const description = product.description || 'Premium cigar from CigarLounge';
  const image = typeof product.image === 'string' ? product.image : (product.images?.[0] || product.image || '/images/placeholder.png');
  const url = `https://cigar-lounge-one.vercel.app/${locale}/product/${id}`;

  return {
    title: `${name} | CigarLounge`,
    description: description.slice(0, 160),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: name,
      description: description.slice(0, 160),
      url,
      images: [
        {
          url: image,
          width: 800,
          height: 600,
          alt: name,
        },
      ],
    },
  };
}

export default async function ProductPageWrapper({ params }) {
  const { id } = await params;
  
  let product = null;
  if (supabaseAdmin) {
    const decodedId = decodeURIComponent(id);
    const { data } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', decodedId)
      .single();
    product = data;
  }

  // Generate JSON-LD Schema
  let schemaData = null;
  if (product) {
    const name = product.name || 'Product';
    const description = product.description || '';
    const image = typeof product.image === 'string' ? product.image : (product.images?.[0] || product.image || '');
    
    let price = '0.00';
    let availability = 'https://schema.org/OutOfStock';
    
    if (product.models && product.models.length > 0) {
       price = product.models[0].price || '0.00';
       const totalStock = product.models.reduce((acc, m) => {
          if (m.stock === undefined || m.stock === null || m.stock === '') return acc + 100; // Infinity treated as in stock
          return acc + (parseInt(m.stock) || 0);
       }, 0);
       availability = totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
    }

    schemaData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": name,
      "image": image,
      "description": description,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "EGP",
        "price": price,
        "availability": availability,
        "url": `https://cigar-lounge-one.vercel.app/product/${id}`
      }
    };
  }

  return (
    <>
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
      {product && (
        <h1 className="visually-hidden" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
          {product.name}
        </h1>
      )}
      <ProductClient params={params} />
    </>
  );
}
