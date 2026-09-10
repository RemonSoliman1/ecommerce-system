const fs = require('fs');
const { execSync } = require('child_process');

const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');

for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const [key, ...rest] = line.split('=');
    const value = rest.join('=').trim().replace(/^"|"$/g, '');
    
    if (key && value) {
        console.log(`Adding ${key}...`);
        try {
            // First remove it if it exists to be safe
            try {
                execSync(`npx vercel env rm ${key} production -y`);
            } catch(e) {}
            // Then add it
            execSync(`npx vercel env add ${key} production`, { input: value });
            console.log(`Added ${key}`);
        } catch (e) {
            console.log(`Error adding ${key}`);
        }
    }
}
