import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
}

// Prevent multiple instances of Supabase Client in development/browser
const globalObj = typeof window !== 'undefined' ? window : global;
export const supabase = globalObj.supabase || createClient(supabaseUrl, supabaseKey);

if (process.env.NODE_ENV !== 'production') {
    globalObj.supabase = supabase;
}
