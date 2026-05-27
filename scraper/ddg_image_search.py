from duckduckgo_search import DDGS
import json
import sys

queries = {
    'oliva-journey': 'Oliva 8-Cigar Assortment',
    'oliva-festive': 'Oliva 12-Cigar Sampler box',
    'oliva-taste': 'Oliva 5-Cigar sampler pack',
    'nub-calendar': 'Nub Advent Calendar Sampler',
    'oliva-melanio-2024': 'Oliva Serie V Melanio Edicion Limitada 2024',
    'perdomo-connoisseur': 'Perdomo Connoisseur Collection 12 cigars',
    'plasencia-robusto-collection': 'Plasencia Robusto Collection Sampler box',
    'camacho-best-90': 'Camacho Best of the Best sampler',
    'fuente-holiday-robusto': 'Arturo Fuente 5 Robusto Sampler',
    'fuente-holiday-toro': 'Arturo Fuente 5 Toro Sampler',
    'drew-factory-maduro': 'Factory Smokes Maduro bundle',
    'quorum-classic': 'Quorum Classic Bundle',
    'macanudo-ascot': 'Macanudo Cafe Ascot Cigarillos tin',
    'ryj-mini': 'Romeo y Julieta Mini cigarillo tin'
}

ddgs = DDGS()
results = {}

for id, query in queries.items():
    res = ddgs.images(query + ' cigar', max_results=1)
    if res:
        results[id] = res[0]['image']
        print(f"FOUND: {id} -> {res[0]['image']}")
    else:
        results[id] = None
        print(f"NOT FOUND: {id}")

with open('scraper/sampler_image_urls.json', 'w') as f:
    json.dump(results, f, indent=2)
