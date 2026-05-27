import time
import requests
from duckduckgo_search import DDGS
import json

queries = {
    'oliva-journey': 'Oliva 8-Cigar Assortment box',
    'oliva-festive': 'Oliva 12-Cigar Sampler box',
    'oliva-taste': 'Taste of Oliva Sampler box',
    'nub-calendar': 'Nub Advent Calendar Sampler',
    'oliva-melanio-2024': 'Oliva Serie V Melanio Edicion Limitada 2024 box',
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
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for id, query in queries.items():
    print(f"Searching: {query}...")
    try:
        results = list(ddgs.images(query + ' cigar', max_results=2))
        img_url = None
        for r in results:
            if r['image'].startswith('http'):
                img_url = r['image']
                break
        
        if img_url:
            print(f"FOUND: {img_url}")
            res = requests.get(img_url, headers=headers, timeout=10)
            if res.status_code == 200:
                with open(f"{id}_raw.png", 'wb') as f:
                    f.write(res.content)
                print(f"Downloaded {id}_raw.png")
            else:
                print(f"Failed to download {img_url} (Status: {res.status_code})")
        else:
            print("No image found.")
    except Exception as e:
        print(f"Error: {e}")
    
    print("Sleeping 5 seconds...\n")
    time.sleep(5)
