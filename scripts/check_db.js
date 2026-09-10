const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: users, error: uErr } = await supabase.from('users').select('id, email, created_at');
    console.log('USERS:', users ? users.length : uErr);
    
    const { data: orders, error: oErr } = await supabase.from('orders').select('id, status, total_amount');
    console.log('ORDERS:', orders ? orders.length : oErr);

    const { data: promos, error: pErr } = await supabase.from('promotions').select('*');
    console.log('PROMOS:', promos ? promos.length : pErr);
    
    const { data: gifts, error: gErr } = await supabase.from('gifts').select('*');
    console.log('GIFTS:', gifts ? gifts.length : gErr);
}
check();
