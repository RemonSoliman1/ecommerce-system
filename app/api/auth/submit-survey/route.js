import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
    try {
        const { email, favorite_profiles, favorite_brands, most_smoked_cigar, weekend_start_day, preferred_engagement_time } = await request.json();

        if (!email) {
            return Response.json({ success: false, error: 'Missing email' }, { status: 400 });
        }

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return Response.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const preferred_stockup_day = weekend_start_day === 6 ? 4 : 3;

        const { error } = await supabaseAdmin
            .from('users')
            .update({ 
                survey_completed: true,
                favorite_profiles: favorite_profiles || [],
                favorite_brands: favorite_brands || [],
                most_smoked_cigar: most_smoked_cigar || null,
                weekend_start_day, 
                preferred_stockup_day,
                preferred_engagement_time
            })
            .eq('id', user.id);

        if (error) {
            return Response.json({ success: false, error: error.message }, { status: 500 });
        }

        return Response.json({ success: true });

    } catch (error) {
        return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
