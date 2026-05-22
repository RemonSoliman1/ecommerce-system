const axios = require('axios');

const brandsToCheck = [
    'camacho',
    'zino',
    'zino-platinum',
    'rocky-patel',
    'ashton',
    'cao',
    'punch',
    'gurkha',
    'el-septimo',
    'san-cristobal',
    'avo',
    'padilla',
    'h-upmann',
    'alec-bradley'
];

async function checkBrands() {
    console.log("Checking brand URLs on Holts...");
    const validBrands = [];
    const invalidBrands = [];

    for (const slug of brandsToCheck) {
        const url = `https://www.holts.com/cigars/all-cigar-brands/brand/${slug}`;
        try {
            const res = await axios.get(url);
            if (res.status === 200) {
                validBrands.push(slug);
            }
        } catch (e) {
            invalidBrands.push(slug);
        }
    }

    console.log("\nValid Brands on Holts:");
    console.log(validBrands);
    console.log("\nInvalid / Not Found Brands:");
    console.log(invalidBrands);
}

checkBrands();
