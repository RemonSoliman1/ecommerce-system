const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('attributes').select('category').then(({data, error}) => {
    if (error) return console.log('ERROR:', error);
    if (!data) return console.log('No data');
    const categories = [...new Set(data.map(d => d.category))];
    console.log(categories);
});
