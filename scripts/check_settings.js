const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('system_settings').select('*').then(({data, error}) => {
    if (error) return console.log('ERROR:', error);
    console.log(data);
});
