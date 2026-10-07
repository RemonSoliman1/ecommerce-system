const fs = require('fs');
let content = fs.readFileSync('app/[locale]/admin/page.js', 'utf8');

const regex = /const handleImageUpload = async \(e\) => \{[\s\S]*?if \(uploadedUrls\.length > 0\) \{/;

const newFunc = `const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploadingImage(true);
        const uploadedUrls = [];

        try {
            for (const file of files) {
                const isVideo = file.type.startsWith('video/');

                if (!isVideo && file.size > 5 * 1024 * 1024) {
                    alert(\`Skipped \${file.name}: Image size must be less than 5MB\`);
                    continue;
                }
                
                if (isVideo && file.size > 100 * 1024 * 1024) {
                    alert(\`Skipped \${file.name}: Video size must be less than 100MB\`);
                    continue;
                }

                if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
                    alert(\`Skipped \${file.name}: Unsupported format\`);
                    continue;
                }

                if (isVideo) {
                    const res = await fetch('/api/admin/upload-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fileName: file.name, fileType: file.type })
                    });
                    const data = await res.json();
                    
                    if (data.success) {
                        const uploadRes = await fetch(data.signedUrl, {
                            method: 'PUT',
                            headers: { 'Content-Type': file.type },
                            body: file
                        });
                        if (uploadRes.ok) {
                            uploadedUrls.push(data.publicUrl);
                        } else {
                            alert(\`Failed to upload video \${file.name} to storage bucket.\`);
                        }
                    } else {
                        alert(\`Failed to get signed URL for \${file.name}: \` + (data.error || 'Unknown error'));
                    }
                } else {
                    const formData = new FormData();
                    formData.append('file', file);

                    const res = await fetch('/api/admin/upload-image', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await res.json();
                    if (data.success) {
                        uploadedUrls.push(data.url);
                    } else {
                        alert(\`Failed to upload \${file.name}: \` + (data.error || 'Unknown error'));
                    }
                }
            }

            if (uploadedUrls.length > 0) {`;

content = content.replace(regex, newFunc);
fs.writeFileSync('app/[locale]/admin/page.js', content);
