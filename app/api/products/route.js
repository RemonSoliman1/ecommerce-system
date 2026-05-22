
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification } from '@/lib/push';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey); // Keep for GET requests (public)

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return NextResponse.json(data);
        }

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Re-use logic for PUT (Update)
export async function PUT(request) {
    return POST(request);
}

export async function POST(request) {
    try {
        const body = await request.json();

        // Proactive Payload Cleaning: PostgreSQL strictly rejects "" for numeric/uuid columns
        Object.keys(body).forEach(key => {
            // Skip booleans outright to avoid mutation
            if (typeof body[key] === 'boolean') {
                return;
            }

            // Convert empty strings to null safely
            if (body[key] === '') {
                body[key] = null;
            }
        });

        // 1. Enforce strict Database Schema Types for Top-Level numeric columns
        if (body.price !== undefined && body.price !== null) {
            body.price = parseFloat(body.price) || 0;
        }
        // Removed the artificial float parsing for 'rating' so it can store text like "93 Points - Cigar Snob"

        // Clean internal JSONB arrays natively if needed
        if (Array.isArray(body.models)) {
            body.models = body.models.map(m => {
                m.price = parseFloat(m.price) || 0;
                m.stock = parseInt(m.stock) || 0;

                // Inject available_gifts inside the JSONB model to bypass schema limits
                if (body.available_gifts !== undefined) {
                    m.product_available_gifts = body.available_gifts;
                }
                return m;
            });
        }

        // Strip out top-level transient properties that don't belong in the static DB Schema
        if (body.hasOwnProperty('available_gifts')) {
            delete body.available_gifts;
        }

        // 1. Authorization Check
        if (body.admin_secret !== 'admin@129') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Remove secret from payload
        delete body.admin_secret;

        // 2. Use Admin Client to Insert (Bypasses RLS)
        if (!supabaseAdmin) {
            throw new Error('Server misconfiguration: Admin client not available');
        }

        const isNew = !body.id;

        const { data, error } = await supabaseAdmin
            .from('products')
            .upsert(body)
            .select()
            .single();

        if (error) throw error;

        // Dispatch new arrival push
        if (isNew && data) {
            try {
                await sendPushNotification({
                    title: 'New Arrival! 🌟',
                    body: `${data.name} has just been added to our humidor.`,
                    url: `/product/${data.id}`,
                    image: data.image,
                    targetType: 'all'
                });
            } catch (pushErr) {
                console.error("New Arrival push failed:", pushErr);
            }
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const adminSecret = searchParams.get('admin_secret');

        if (adminSecret !== 'admin@129') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            throw new Error('Server misconfiguration: Admin client not available');
        }

        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
