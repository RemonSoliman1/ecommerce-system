const fs = require('fs');

// We are providing a structured dataset since Imperva/Cloudflare blocks basic Puppeteer on almost all cigar sites.
const seedProducts = [
    {
        id: "arturo-fuente-hemingway-short-story",
        brandId: "arturo-fuente",
        name: "Arturo Fuente Hemingway Short Story",
        type: "cigar",
        description: "A masterful short unaged figurado, crafted by the Fuente family with a rich African Cameroon wrapper.",
        strength: "Medium",
        image: "/images/brands/fuente/hemingway-short-story.jpg",
        models: [
            { name: "Single", size: "4.0 x 49", price: 8.50 },
            { name: "Box of 25", size: "4.0 x 49", price: 212.50 }
        ]
    },
    {
        id: "arturo-fuente-opusx-lost-city",
        brandId: "arturo-fuente",
        name: "Arturo Fuente OpusX Lost City Robusto",
        type: "cigar",
        description: "One of the rarest cigars in the world, featuring 100% Dominican grown tobacco from Chateau de la Fuente.",
        strength: "Full",
        image: "/images/brands/fuente/opusx-lost-city.jpg",
        models: [
            { name: "Single", size: "5.2 x 50", price: 32.00 },
            { name: "Box of 22", size: "5.2 x 50", price: 680.00 }
        ]
    },
    {
        id: "padron-1964-anniversary-maduro",
        brandId: "padron",
        name: "Padrón 1964 Anniversary Series Exclusivo Maduro",
        type: "cigar",
        description: "A rare box-pressed Nicaraguan puro combining complex aromas of chocolate, coffee, and nuts.",
        strength: "Full",
        image: "/images/brands/padron/1964-exclusivo.jpg",
        models: [
            { name: "Single", size: "5.5 x 50", price: 16.50 },
            { name: "Box of 25", size: "5.5 x 50", price: 412.50 }
        ]
    },
    {
        id: "liga-privada-no9",
        brandId: "drew-estate",
        name: "Liga Privada No. 9 Toro",
        type: "cigar",
        description: "Flawlessly constructed from 7 different aged tobaccos, finished in a dark Connecticut Broadleaf wrapper.",
        strength: "Full",
        image: "/images/brands/drew-estate/liga-no9.jpg",
        models: [
            { name: "Single", size: "6.0 x 52", price: 18.00 },
            { name: "Box of 24", size: "6.0 x 52", price: 432.00 }
        ]
    },
    {
        id: "montecristo-white-series-rothschild",
        brandId: "montecristo",
        name: "Montecristo White Series Rothschild",
        type: "cigar",
        description: "A mellow, creamy blend coated in a gorgeous hand-selected Ecuadorian Connecticut Shade wrapper.",
        strength: "Mellow to Medium",
        image: "/images/brands/montecristo/white-rothschild.jpg",
        models: [
            { name: "Single", size: "5.0 x 52", price: 12.50 },
            { name: "Box of 27", size: "5.0 x 52", price: 337.50 }
        ]
    }
];

fs.writeFileSync('seed_data.json', JSON.stringify(seedProducts, null, 2));
console.log("Successfully generated seed_data.json containing hand-curated real cigar data.");
console.log("You can now securely upload this using: node upload.js seed_data.json");
