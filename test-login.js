const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testApi() {
    const email = 'remoneg70@gmail.com';
    const password = 'admin@129';
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const safeId = email.replace(/"/g, '""');
    
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq."${safeId}",name.eq."${safeId}"`)
        .single();
        
    if (error) {
        console.error('Supabase Error:', error);
    } else {
        console.log('User found:', user.email, '| Role:', user.role);
        if (user.password === password) {
            console.log('Password matches!');
        } else {
            console.log('Password does NOT match!');
        }
    }
}
testApi();
