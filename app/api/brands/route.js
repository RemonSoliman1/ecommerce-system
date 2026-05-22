import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BRANDS as staticBrands } from '@/lib/data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey); // Public access

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        // Fetch custom brands from product_attributes
        const { data, error } = await supabase
            .from('product_attributes')
            .select('*')
            .eq('category', 'brand');

        if (error) throw error;

        const dbBrands = data.map(attr => ({
            id: attr.value.toLowerCase().replace(/\s+/g, '-'),
            name: attr.value,
            logo: attr.metadata?.image || null
        }));

        // Merge: Priority given to DB Brands so Admin edits override Static ones
        const mergedMap = new Map();
        
        // 1. Add all static brands
        staticBrands.forEach(b => mergedMap.set(b.id, b));
        
        // 2. Override/Append with DB brands
        dbBrands.forEach(b => {
             // Avoid completely breaking static brands if DB brand lacks logo, 
             // but if DB brand was dynamically uploaded, override it
             const existing = mergedMap.get(b.id);
             if (existing && !b.logo) {
                 // Skip overriding if the DB edit doesn't have an image but static does
                 mergedMap.set(b.id, { ...existing, name: b.name });
             } else {
                 mergedMap.set(b.id, b);
             }
        });

        const finalBrandsList = Array.from(mergedMap.values());
        finalBrandsList.sort((a, b) => a.name.localeCompare(b.name));

        return NextResponse.json({ success: true, brands: finalBrandsList });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
