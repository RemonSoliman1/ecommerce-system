const fs = require('fs');

const content = fs.readFileSync('app/[locale]/admin/page.js', 'utf8');
const lines = content.split('\n');

// Find Product Images block
let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<label>Product Images (First image is Main)</label>')) {
        start = i - 1; // get the `<div className={styles.formGroup}>`
        for (let j = start; j < lines.length; j++) {
            if (lines[j].includes('{/* Image Preview Modal */}')) {
                // Keep going until `)}`
                for (let k = j; k < lines.length; k++) {
                    if (lines[k].includes(')}')) {
                        end = k + 1; // include the empty line or the closing brace
                        break;
                    }
                }
                break;
            }
        }
        break;
    }
}

console.log(`Extracting from ${start} to ${end}`);
const block = lines.slice(start, end).join('\n');

// Remove from old location
lines.splice(start, end - start);

// Find insert point (after Cigar Aficionado)
let insertPoint = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Cigar Aficionado (0-100 Points)')) {
        // Go down to the closing div of this formGroup
        for (let j = i; j < lines.length; j++) {
            if (lines[j].trim() === '</div>') {
                insertPoint = j + 1;
                break;
            }
        }
        break;
    }
}

console.log(`Inserting at ${insertPoint}`);
lines.splice(insertPoint, 0, '\n' + block);

// Also replace 20px with 40px for gift images
const resultStr = lines.join('\n').replace(/width: '20px', height: '20px', objectFit: 'cover'/g, "width: '40px', height: '40px', objectFit: 'cover'");

// Update Drag and Drop HTML
let newContent = resultStr.replace(
    /{(formData\.images \|\| \[\])\.map\(\(img, idx\) => \(/,
    `{(formData.images || []).map((img, idx) => (\n                                    <div key={idx} draggable onDragStart={() => handleImageDragStart(idx)} onDragOver={handleImageDragOver} onDrop={() => handleImageDrop(idx)} style={{ position: 'relative', border: formData.image === img ? '2px solid var(--color-accent)' : '1px solid #333', borderRadius: '4px', overflow: 'hidden', aspectRatio: '1/1', background: '#000', cursor: 'grab' }}>\n                                        {/* Original content follows, we replace the first div */}`
).replace(
    /<div key={idx} style={{ position: 'relative', border: formData\.image === img \? '2px solid var\(--color-accent\)' : '1px solid #333', borderRadius: '4px', overflow: 'hidden', aspectRatio: '1\/1', background: '#000' }}>/,
    `` // Removed the original div since we added it above
);

// Insert drag state and functions
const dragFunctions = `
    const [draggedImageIndex, setDraggedImageIndex] = useState(null);

    const handleImageDragStart = (idx) => {
        setDraggedImageIndex(idx);
    };

    const handleImageDragOver = (e) => {
        e.preventDefault();
    };

    const handleImageDrop = (idx) => {
        if (draggedImageIndex === null || draggedImageIndex === idx) return;
        setFormData(prev => {
            const newImages = [...prev.images];
            const dragged = newImages[draggedImageIndex];
            newImages.splice(draggedImageIndex, 1);
            newImages.splice(idx, 0, dragged);
            return { ...prev, images: newImages };
        });
        setDraggedImageIndex(null);
    };
`;

newContent = newContent.replace(
    /const \[uploadingImage, setUploadingImage\] = useState\(false\);/,
    dragFunctions + '\n    const [uploadingImage, setUploadingImage] = useState(false);'
);

fs.writeFileSync('app/[locale]/admin/page.js', newContent);
console.log('Done');
