import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    if (!category) {
        return NextResponse.json({ success: false, error: 'Category required' }, { status: 400 });
    }
    
    try {
        const { data, error } = await supabaseAdmin
            .from('product_attributes')
            .select('*')
            .eq('category', category);
            
        if (error) throw error;
        
        return NextResponse.json({ success: true, data });
    } catch (e) {
        console.error('Error fetching attributes:', e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
