'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ui/ProductCard';

export default function RelatedProducts({ currentProductId, category, brandId }) {
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRelated() {
            setLoading(true);
            try {
                let query = supabase
                    .from('products')
                    .select('*')
                    .neq('id', currentProductId)
                    .eq('is_visible', true)
                    .limit(4);

                if (category && brandId) {
                    query = query.or(`category.eq.${category},brand_id.eq.${brandId}`);
                } else if (category) {
                    query = query.eq('category', category);
                } else if (brandId) {
                    query = query.eq('brand_id', brandId);
                }

                const { data, error } = await query;
                
                if (!error && data) {
                    setRelated(data);
                }
            } catch (err) {
                console.error("Error fetching related products", err);
            } finally {
                setLoading(false);
            }
        }
        
        if (currentProductId) {
            fetchRelated();
        }
    }, [currentProductId, category, brandId]);

    if (loading || related.length === 0) return null;

    return (
        <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3rem', width: '100%' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-text-primary)', marginBottom: '2rem', textAlign: 'center' }}>
                People Also Buy This
            </h2>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '2rem', 
                width: '100%', 
                maxWidth: '1300px', 
                margin: '0 auto' 
            }}>
                {related.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
