import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
);

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const idsString = searchParams.get('ids');
        if (!idsString) return new Response('Missing ids', { status: 400 });

        const ids = idsString.split(',').slice(0, 9); // Max 9 images for 3x3 grid

        // Fetch products
        const { data: products } = await supabaseAdmin
            .from('products')
            .select('image')
            .in('id', ids);

        if (!products || products.length === 0) {
            return new Response('No products found', { status: 404 });
        }

        const images = products.map(p => p.image).filter(Boolean);
        
        // Calculate grid
        let cols = 1;
        let rows = 1;
        const len = images.length;
        if (len === 2) { cols = 2; rows = 1; }
        else if (len === 3 || len === 4) { cols = 2; rows = 2; }
        else if (len === 5 || len === 6) { cols = 3; rows = 2; }
        else if (len >= 7) { cols = 3; rows = 3; }

        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        background: '#0a0a0a',
                        width: '100%',
                        height: '100%',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px',
                    }}
                >
                    <div style={{ display: 'flex', color: '#e8d3a2', fontSize: '60px', fontWeight: 'bold', marginBottom: '40px', textTransform: 'uppercase', letterSpacing: '4px' }}>
                        New Arrivals
                    </div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '20px',
                        width: '100%',
                        height: '80%',
                    }}>
                        {images.map((src, i) => (
                            <img 
                                key={i}
                                src={src} 
                                style={{
                                    width: `${90 / cols}%`,
                                    height: `${90 / rows}%`,
                                    objectFit: 'cover',
                                    borderRadius: '16px',
                                    border: '4px solid #1a1a1a',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                }} 
                            />
                        ))}
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 800,
            }
        );
    } catch (e) {
        console.error(e);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
