import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Link } from '@/lib/navigation';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
    const { id } = await params;
    return {
        title: 'Sponsored By | Cigar Lounge'
    };
}

export default async function SponsorPage({ params }) {
    const { id } = await params;

    const { data: sponsor, error } = await supabaseAdmin
        .from('product_attributes')
        .select('*')
        .eq('id', id)
        .eq('category', 'home_promotion')
        .single();

    if (error || !sponsor) {
        notFound();
    }

    const { title, subtitle, image, sponsor_layout = 'top', sponsor_images = [] } = sponsor.metadata || {};

    const TextContent = () => (
        <div style={{ flex: 1, textAlign: sponsor_layout === 'top' ? 'center' : 'left' }}>
            {title && <h1 style={{ color: 'var(--color-accent)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>{title}</h1>}
            {subtitle && (
                <div style={{ color: '#ccc', lineHeight: '1.8', fontSize: '1.1rem', textAlign: 'justify' }}>
                    {subtitle.split('\n').map((paragraph, i) => (
                        <p key={i} style={{ marginBottom: '1rem' }}>{paragraph}</p>
                    ))}
                </div>
            )}
        </div>
    );

    const MainImage = () => (
        image ? (
            <div style={{ flex: sponsor_layout === 'top' ? 'none' : 1, display: 'flex', justifyContent: 'center' }}>
                <img 
                    src={image} 
                    alt={title || "Sponsor"} 
                    style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }}
                />
            </div>
        ) : null
    );

    return (
        <div style={{ minHeight: '80vh', padding: '4rem 2rem', background: 'var(--color-background)', color: 'var(--color-text-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '1000px', marginBottom: '2rem' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 'bold' }}>
                    <ArrowLeft size={20} /> Back to Home
                </Link>
            </div>

            <div style={{ width: '100%', maxWidth: '1000px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '3rem', border: '1px solid var(--color-border)' }}>
                
                {/* Dynamic Layout Block */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: sponsor_layout === 'top' ? 'column' : 'row', 
                    gap: '3rem',
                    alignItems: sponsor_layout === 'top' ? 'center' : 'flex-start',
                    marginBottom: sponsor_images.length > 0 ? '4rem' : '0'
                }}>
                    {sponsor_layout === 'top' && (
                        <>
                            <MainImage />
                            <TextContent />
                        </>
                    )}
                    {sponsor_layout === 'left' && (
                        <>
                            <MainImage />
                            <TextContent />
                        </>
                    )}
                    {sponsor_layout === 'right' && (
                        <>
                            <TextContent />
                            <MainImage />
                        </>
                    )}
                </div>

                {/* Additional Gallery Photos with Custom Placements */}
                {sponsor_images && sponsor_images.length > 0 && (
                    <div style={{ marginTop: '3rem', borderTop: '1px solid #222', paddingTop: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Render inline and full width images */}
                        {sponsor_images.filter(img => typeof img === 'object' && img.layout && img.layout !== 'bottom_gallery').map((img, idx) => (
                            <div key={`custom-${idx}`} style={{ 
                                display: 'flex', 
                                justifyContent: img.layout === 'inline_left' ? 'flex-start' : (img.layout === 'inline_right' ? 'flex-end' : 'center'),
                                width: '100%'
                            }}>
                                <img 
                                    src={img.url} 
                                    alt={`Sponsor Asset ${idx + 1}`} 
                                    style={{ 
                                        width: img.layout === 'full_width' ? '100%' : '50%', 
                                        maxHeight: img.layout === 'full_width' ? '500px' : '400px',
                                        objectFit: 'contain', 
                                        borderRadius: '8px', 
                                        border: '1px solid #333',
                                        background: 'rgba(255,255,255,0.02)'
                                    }}
                                />
                            </div>
                        ))}

                        {/* Render standard gallery grid */}
                        {sponsor_images.some(img => typeof img === 'string' || !img.layout || img.layout === 'bottom_gallery') && (
                            <div>
                                <h3 style={{ color: 'var(--color-accent)', marginBottom: '2rem', textAlign: 'center', fontSize: '1.8rem' }}>Gallery</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                    {sponsor_images.map((img, idx) => {
                                        const isString = typeof img === 'string';
                                        const layout = isString ? 'bottom_gallery' : (img.layout || 'bottom_gallery');
                                        const url = isString ? img : img.url;
                                        
                                        if (layout !== 'bottom_gallery') return null;
                                        
                                        return (
                                            <img 
                                                key={`gallery-${idx}`} 
                                                src={url} 
                                                alt={`Gallery ${idx + 1}`} 
                                                style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #333' }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
