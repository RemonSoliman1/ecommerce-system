import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request) {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        // 1. Mark as Slipping (Inactive between 30 and 60 days)
        await supabaseAdmin.from('users').update({ activity_status: 'Slipping' })
            .lt('last_active_at', thirtyDaysAgo.toISOString())
            .gte('last_active_at', sixtyDaysAgo.toISOString());

        // 2. Mark as Dormant (Inactive > 60 days)
        await supabaseAdmin.from('users').update({ activity_status: 'Dormant' })
            .lt('last_active_at', sixtyDaysAgo.toISOString());

        // 3. Mark as Active (Inactive < 30 days)
        await supabaseAdmin.from('users').update({ activity_status: 'Active' })
            .gte('last_active_at', thirtyDaysAgo.toISOString());

        return NextResponse.json({ success: true, message: "Lifecycle Monitor Complete" });
    } catch (error) {
        console.error("Monitor Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
