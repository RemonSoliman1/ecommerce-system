import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        // Fetch global checkout settings (assuming they are stored in persistent attributes)
        // Here we just use a default 'none' if it hasn't been configured in DB yet
        let globalMode = 'none'; 
        
        try {
            const { data: attrData } = await supabaseAdmin
                .from('product_attributes')
                .select('value')
                .eq('category', 'checkout_settings')
                .single();
                
            if (attrData && attrData.value) {
                // If value is stored as a stringified JSON, or just plain string
                let settings = {};
                try { settings = JSON.parse(attrData.value); } catch(e) { settings = attrData.value; }
                
                if (settings.receipt_requirement_mode) {
                    globalMode = settings.receipt_requirement_mode;
                } else if (typeof settings === 'string') {
                    globalMode = settings;
                }
            }
        } catch (e) {
            // It's okay if the attribute doesn't exist yet
        }

        let requireReceipt = false;

        if (globalMode === 'all') {
            requireReceipt = true;
        } else if (globalMode === 'specific' && email) {
            // Check specific customer list stored in settings
            let restrictedEmails = [];
            try {
                const { data: attrData } = await supabaseAdmin
                    .from('product_attributes')
                    .select('value')
                    .eq('category', 'checkout_settings')
                    .single();
                
                if (attrData && attrData.value) {
                    let settings = {};
                    try { settings = JSON.parse(attrData.value); } catch(e) {}
                    if (settings.restricted_emails && Array.isArray(settings.restricted_emails)) {
                        restrictedEmails = settings.restricted_emails;
                    }
                }
            } catch(e) {}

            if (restrictedEmails.includes(email)) {
                requireReceipt = true;
            }
        }

        return NextResponse.json({ success: true, requireReceipt, globalMode });

    } catch (error) {
        console.error("Checkout Settings Error:", error.message);
        return NextResponse.json({ success: false, requireReceipt: false, globalMode: 'none' }, { status: 500 });
    }
}
