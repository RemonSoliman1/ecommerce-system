import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import products from '@/data/products.json';
import { BRANDS } from '@/lib/data';

// SEC-3: Admin secret is now read from environment variable, never hardcoded.
// Set ADMIN_SECRET in your .env.local / Vercel environment variables.
// Call this endpoint with: POST /api/admin/seed  { "admin_secret": "<your-secret>" }
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const adminSecret = body.admin_secret;

        if (!process.env.ADMIN_SECRET || adminSecret !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Admin client not available. Check SUPABASE_SERVICE_KEY.' }, { status: 500 });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const p of products) {
            // Find Brand for Origin
            const brand = BRANDS.find(b => b.id === p.brandId);

            // Map legacy JSON fields to DB columns
            const dbProduct = {
                id: p.id,
                brand_id: p.brandId, // Map brandId -> brand_id
                name: p.name,
                type: p.type,
                series: p.series,
                description: p.description,
                strength: p.strength,
                flavor_profile: p.flavor_profile,
                rating: p.rating,
                image: p.image,
                models: p.models,
                category: p.category,
                origin: brand ? brand.origin : null, // Map Origin
                is_new: p.new || false
            };

            const { error } = await supabaseAdmin
                .from('products')
                .upsert(dbProduct, { onConflict: 'id' });

            if (error) {
                console.error(`Failed to seed ${p.id}:`, error);
                results.failed++;
                results.errors.push(`${p.id}: ${error.message}`);
            } else {
                results.success++;
            }
        }

        return NextResponse.json({
            message: 'Seeding completed',
            results
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
