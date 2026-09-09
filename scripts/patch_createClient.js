const fs = require('fs');

const files = [
    'app/api/admin/attributes/route.js',
    'app/api/admin/customers/update/route.js',
    'app/api/admin/orders/route.js',
    'app/api/admin/orders/confirm/route.js',
    'app/api/admin/users/route.js',
    'app/api/auth/sync-user/route.js',
    'app/api/brands/route.js',
    'app/api/orders/route.js',
    'app/api/orders/create/route.js',
    'app/api/products/route.js',
    'app/api/telegram/webhook/route.js'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Remove manual supabase creation for public client
    content = content.replace(/const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL;?\n/g, '');
    content = content.replace(/const supabaseKey = process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY;?\n/g, '');
    content = content.replace(/const supabase = createClient\(supabaseUrl, supabaseKey\);?( \/\/.*)?\n/g, '');
    
    // 2. Remove left-over getSupabaseAdmin factories that the previous script missed
    content = content.replace(/const getSupabaseAdmin = \(\) => \{[\s\S]*?return createClient\([\s\S]*?\}\);\s*\};?/m, '');

    // 3. Remove createClient imports
    content = content.replace(/^import \{ createClient \} from '@supabase\/supabase-js';?\r?\n/gm, '');

    // 4. Add import { supabase } if not present (only if the file used to have createClient(supabaseUrl, supabaseKey))
    if (!content.includes('import { supabase }') && !content.includes('import { supabaseAdmin }')) {
        content = "import { supabase } from '@/lib/supabaseClient';\n" + content;
    } else if (!content.includes('import { supabase }') && content.includes('import { supabaseAdmin }')) {
        content = content.replace(/import \{ supabaseAdmin \} from '@\/lib\/supabaseAdmin';?/, "import { supabaseAdmin } from '@/lib/supabaseAdmin';\nimport { supabase } from '@/lib/supabaseClient';");
    }

    fs.writeFileSync(file, content);
    console.log('Cleaned', file);
});
