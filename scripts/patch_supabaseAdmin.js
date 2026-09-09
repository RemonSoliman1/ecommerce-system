const fs = require('fs');

const files = [
    'app/api/admin/attributes/route.js',
    'app/api/admin/customers/update/route.js',
    'app/api/admin/orders/route.js',
    'app/api/admin/orders/cancel/route.js',
    'app/api/admin/orders/confirm/route.js',
    'app/api/admin/users/route.js'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Remove the factory function block
    const factoryRegex = /const getSupabaseAdmin = \(\) => \{[\s\S]*?return createClient\([\s\S]*?\}\);?\s*\n\};\n?/m;
    content = content.replace(factoryRegex, '');

    // Replace const supabase = getSupabaseAdmin(); with const supabase = supabaseAdmin;
    content = content.replace(/const supabase = getSupabaseAdmin\(\);?/g, 'const supabase = supabaseAdmin;');

    // Add import if missing
    if (!content.includes('import { supabaseAdmin }')) {
        // Find last import
        const imports = content.match(/^import .*$/gm) || [];
        if (imports.length > 0) {
            const lastImport = imports[imports.length - 1];
            content = content.replace(lastImport, lastImport + "\nimport { supabaseAdmin } from '@/lib/supabaseAdmin';");
        } else {
            content = "import { supabaseAdmin } from '@/lib/supabaseAdmin';\n" + content;
        }
    }

    // Remove import { createClient } if no longer used
    if (!content.includes('createClient(')) {
        content = content.replace(/^import \{ createClient \} from '@supabase\/supabase-js';?\n/gm, '');
    }

    fs.writeFileSync(file, content);
    console.log('Patched', file);
});
