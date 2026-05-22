import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
}

// Prevent multiple instances of Supabase Client in development
export const supabase = global.supabase || createClient(supabaseUrl, supabaseKey)

if (process.env.NODE_ENV !== 'production') {
    global.supabase = supabase
}
