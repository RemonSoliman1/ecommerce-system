import { BRANDS } from '@/lib/data';

// 1. Arabic Normalization
const normalizeArabic = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/[أإآ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/[\u064B-\u065F]/g, '') // Remove tashkeel
        .replace(/[\u0600-\u06FF]/g, (match) => match) // Keep Arabic chars
        .trim();
};

// ... (keywords and distance functions unchanged) ...

// 2. Arabic to English Dictionary (Common Terms & Brands)
const ARABIC_KEYWORDS = {
    'سيجار': 'cigar',
    'سيجاره': 'cigar',
    'كوهيبا': 'cohiba',
    'مونتي': 'montecristo',
    'مونتكريستو': 'montecristo',
    'روميو وجولييت': 'romeo y julieta',
    'روميو و جولييت': 'romeo y julieta',
    'روميو': 'romeo',
    'جولييت': 'julieta',
    'دافيدوف': 'davidoff',
    'اوليفا': 'oliva',
    'ارتورو فوينتي': 'arturo fuente',
    'فوينتي': 'fuente',
    'بادرون': 'padron',
    'باديس': 'padron',
    'بارتاغاس': 'partagas',
    'روكي باتيل': 'rocky patel',
    'كاماتشو': 'camacho',
    'اليك برادلي': 'alec bradley',
    'ماكانودو': 'macanudo',
    'ولاعة': 'lighter',
    'قداحة': 'lighter',
    'قطاعة': 'cutter',
    'مقص': 'cutter',
    'هيوميدور': 'humidor',
    'مرطب': 'humidor',
    'بوكس': 'box',
    'علبة': 'box'
};

// 3. Levenshtein Distance (The standard for fuzzy search)
const levenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

// Calculate Fuzzy Score (0 to 100, where 100 is best)
const getFuzzyScore = (text, query) => {
    if (!text || !query) return 0;

    // Normalize both
    const t = normalizeArabic(text);
    const q = normalizeArabic(query);

    // 1. Exact Match / Contains
    if (t.includes(q)) return 100;

    // 2. Levenshtein Distance
    const distance = levenshteinDistance(t, q);
    const maxLength = Math.max(t.length, q.length);

    // Convert distance to score (Inverse)
    const score = ((maxLength - distance) / maxLength) * 100;

    return score;
};

export const searchProducts = (query, products = []) => {
    if (!query) return [];
    if (!products || products.length === 0) return [];


    let processedQuery = normalizeArabic(query);

    // Check Dictionary for Translation
    // Sort keys by length descending to replace longer phrases first (e.g., 'روميو وجولييت' before 'روميو')
    const sortedArabicKeys = Object.keys(ARABIC_KEYWORDS).sort((a, b) => b.length - a.length);
    for (const arabic of sortedArabicKeys) {
        if (processedQuery.includes(arabic)) {
            processedQuery = processedQuery.replace(new RegExp(arabic, 'g'), ARABIC_KEYWORDS[arabic]);
        }
    }

    // Split query into words for multi-word matching
    const queryWords = processedQuery.split(' ').filter(w => w.length > 2);
    if (queryWords.length === 0 && processedQuery.length > 0) queryWords.push(processedQuery);

    return products.map(p => {
        let maxScore = 0;

        // Fields to search
        const fields = [
            p.name,
            p.type,
            p.category,
            p.description,
            p.series,
            p.brandId // Also search brand ID as text
        ];

        // Also add Brand Name from ID
        const brand = BRANDS.find(b => b.id === p.brandId);
        if (brand) fields.push(brand.name);

        // Check each word against each field
        for (const word of queryWords) {
            let wordMaxScore = 0;
            for (const field of fields) {
                if (!field) continue;
                const score = getFuzzyScore(field.toString(), word);
                if (score > wordMaxScore) wordMaxScore = score;
            }
            // Accumulate score (average or max? Max is safer for "one query word must match well")
            // Let's sum valid scores to reward multiple matches
            if (wordMaxScore > 50) {
                maxScore += wordMaxScore;
            }
        }

        // Normalize maxScore if strictly needed, but sorting works fine with raw sums
        return { product: p, score: maxScore };
    })
        .filter(item => item.score > 55) // Threshold (tried & tested approx)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);
};
