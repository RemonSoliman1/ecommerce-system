const fs = require('fs');
const file = 'app/[locale]/admin/page.js';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /\s*\/\/\s*Editing Brand Modal State\s*setGiftOptionForm\(prev => \(\{ \.\.\.prev, image: data\.url \}\)\);\s*\}\s*\} catch \(e\) \{\s*alert\('Upload failed: ' \+ e\.message\);\s*\}\s*setUploadingGiftImage\(false\);\s*\};\s*/g;

const replacement = `
    // Editing Brand Modal State
    const [editingBrand, setEditingBrand] = useState(null); // { category: 'brand', oldVal, value, image, isPersistent, id }

    const handleGiftImageUpload = async (e) => {
        let file = e.target.files?.[0];
        if (!file) return;

        setUploadingGiftImage(true);
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            setUploadingGiftImage(false);
            return;
        }
        
        const fb = new FormData();
        fb.append('file', file);
        try {
            const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fb });
            const data = await res.json();
            if (data.url) {
                setGiftOptionForm(prev => ({ ...prev, image: data.url }));
            }
        } catch (e) {
            alert('Upload failed: ' + e.message);
        }
        setUploadingGiftImage(false);
    };
`;

if (targetRegex.test(content)) {
    content = content.replace(targetRegex, replacement);
    fs.writeFileSync(file, content);
    console.log('Fixed successfully.');
} else {
    console.log('Target block not found via regex.');
}
