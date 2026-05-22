import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request) {
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
    try {
        // Basic auth check
        if (request.headers.get('authorization') !== `Bearer admin@129`) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { key, value } = await request.json();

        const { error } = await supabaseAdmin.from('system_settings')
            .upsert({ key, value, updated_at: new Date().toISOString() });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
