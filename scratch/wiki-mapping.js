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

async function getUrl(brand) {
    try {
        await delay(1000); // 1 second delay
        let q = encodeURIComponent(brand.query);
        let res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&utf8=&format=json&srnamespace=6`);
        let data = await res.json();
        let titles = data.query.search.map(s => s.title);
        
        if (titles.length === 0) {
            let looser = brand.query.replace(/ cigar logo/g, ' logo').replace(/ cigars/g, '');
            res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(looser)}&utf8=&format=json&srnamespace=6`);
            data = await res.json();
            titles = data.query.search.map(s => s.title);
        }

        if (titles.length > 0) {
            let title = encodeURIComponent(titles[0]);
            let res2 = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=imageinfo&iiprop=url&format=json`);
            let data2 = await res2.json();
            
            let pages = data2.query.pages;
            let pageId = Object.keys(pages)[0];
            let imgUrl = pages[pageId].imageinfo ? pages[pageId].imageinfo[0].url : null;
            return imgUrl;
        }
    } catch(e) {}
    return null;
}

async function run() {
    let mapping = {};
    for (const brand of BRANDS) {
        const url = await getUrl(brand);
        if (url) {
            mapping[brand.slug] = url;
            console.log(brand.slug + ' -> ' + url);
        } else {
            console.log(brand.slug + ' -> NOT FOUND');
        }
    }
    fs.writeFileSync('scratch/wiki_mapping.json', JSON.stringify(mapping, null, 2));
}

run();
