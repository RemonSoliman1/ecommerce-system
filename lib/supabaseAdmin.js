import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn(
        '[supabaseAdmin] SUPABASE_SERVICE_ROLE_KEY is missing. ' +
        'The admin client will be null. All admin operations will fail.'
    );
}

// Service Role Client — BYPASSES RLS. Never expose to the browser.
// Falls back to null (not the anon key) so callers fail fast with a clear error.
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;
