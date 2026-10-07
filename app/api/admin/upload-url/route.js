import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(request) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    try {
        const { fileName, fileType } = await request.json();

        if (!fileName || !fileType) {
            return NextResponse.json({ success: false, error: 'Missing fileName or fileType' }, { status: 400 });
        }

        // Generate Path
        const fileExt = fileName.split('.').pop();
        const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `products/${safeName}`;

        if (!supabaseAdmin) {
            throw new Error('Server misconfiguration: Admin client not available');
        }

        // Create signed upload URL
        const { data, error } = await supabaseAdmin.storage
            .from('product-images')
            .createSignedUploadUrl(filePath);

        if (error) throw error;

        // Get the final public URL that this file will have once uploaded
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return NextResponse.json({ 
            success: true, 
            signedUrl: data.signedUrl, 
            publicUrl 
        });

    } catch (error) {
        console.error('Upload URL Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
