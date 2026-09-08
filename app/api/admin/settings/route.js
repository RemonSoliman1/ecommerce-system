import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    try {
        const { data, error } = await supabaseAdmin.from('system_settings').select('*');
        if (error) throw error;
        
        const settings = {};
        data.forEach(item => {
            settings[item.key] = item.value;
        });

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    try {
        const { key, value } = await request.json();

        const { error } = await supabaseAdmin.from('system_settings')
            .upsert({ key, value, updated_at: new Date().toISOString() });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
