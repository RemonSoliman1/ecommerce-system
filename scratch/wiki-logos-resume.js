const fs = require('fs');

const BRANDS = [
    { slug: 'ashton', query: 'Ashton cigar logo' },
    { slug: 'audew', query: 'Audew logo' },
    { slug: 'avo', query: 'AVO cigar logo' },
    { slug: 'blackened', query: 'Blackened cigar logo' },
    { slug: 'camacho', query: 'Camacho cigar logo' },
    { slug: 'cao', query: 'CAO cigar logo' },
    { slug: 'chateau-diadem', query: 'Chateau Diadem logo' },
    { slug: 'cohiba', query: 'Cohiba cigar logo' },
    { slug: 'davidoff', query: 'Davidoff logo' },
    { slug: 'deadwood', query: 'Deadwood tobacco logo' },
    { slug: 'drew-estate', query: 'Drew Estate logo' },
    { slug: 'ep-carrillo', query: 'E.P. Carrillo logo' },
    { slug: 'oliva', query: 'Oliva cigar logo' },
    { slug: 'montecristo', query: 'Montecristo cigar logo' },
    { slug: 'padron', query: 'Padron cigars logo' },
    { slug: 'romeo-y-julieta', query: 'Romeo y Julieta cigar logo' }
];

async function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

async function run() {
    for (const brand of BRANDS) {
        console.log(`Searching for: ${brand.slug}`);
        try {
            await delay(3000); // 3 seconds delay to respect rate limit
            let q = encodeURIComponent(brand.query);
            let res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&utf8=&format=json&srnamespace=6`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            let data = await res.json();
            
            let titles = data.query.search.map(s => s.title);
            if (titles.length === 0) {
                let looser = brand.query.replace(/ cigar logo/g, ' logo').replace(/ cigars/g, '');
                await delay(2000);
                res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(looser)}&utf8=&format=json&srnamespace=6`);
                data = await res.json();
                titles = data.query.search.map(s => s.title);
            }

            if (titles.length > 0) {
                let title = encodeURIComponent(titles[0]);
                await delay(2000);
                let res2 = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=imageinfo&iiprop=url&format=json`);
                let data2 = await res2.json();
                
                let pages = data2.query.pages;
                let pageId = Object.keys(pages)[0];
                let imgUrl = pages[pageId].imageinfo ? pages[pageId].imageinfo[0].url : null;
                
                if (imgUrl) {
                    let ext = '.png';
                    if (imgUrl.toLowerCase().endsWith('.svg')) ext = '.svg';
                    if (imgUrl.toLowerCase().endsWith('.jpg') || imgUrl.toLowerCase().endsWith('.jpeg')) ext = '.jpg';
                    
                    const imgRes = await fetch(imgUrl);
                    const buffer = await imgRes.arrayBuffer();
                    fs.writeFileSync(`public/images/brands/${brand.slug}${ext}`, Buffer.from(buffer));
                    console.log(`  -> Downloaded ${brand.slug}${ext}`);
                    continue;
                }
            }
            console.log(`  -> No image found for ${brand.slug}`);
        } catch(e) {
            console.error(`  -> Error for ${brand.slug}:`, e.message);
        }
    }
}

run();
