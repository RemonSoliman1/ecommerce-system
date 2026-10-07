import os
import requests
from duckduckgo_search import DDGS

BRANDS = [
    ("20-acre-farm", "20 acre farm cigar logo"),
    ("acid", "ACID cigars logo"),
    ("alec-bradley", "Alec Bradley cigars logo"),
    ("arturo-fuente", "Arturo Fuente cigar logo"),
    ("ashton", "Ashton cigars logo"),
    ("audew", "Audew logo"),
    ("avo", "AVO cigars logo"),
    ("blackened", "Blackened cigars logo"),
    ("camacho", "Camacho cigars logo"),
    ("cao", "CAO cigars logo"),
    ("chateau-diadem", "Chateau Diadem cigar logo"),
    ("cohiba", "Cohiba cigar logo"),
    ("davidoff", "Davidoff cigar logo"),
    ("deadwood", "Deadwood tobacco logo"),
    ("drew-estate", "Drew Estate cigar logo"),
    ("ep-carrillo", "E.P. Carrillo cigar logo"),
    ("oliva", "Oliva cigar logo")
]

OUT_DIR = "public/images/brands"
os.makedirs(OUT_DIR, exist_ok=True)

def download_logos():
    with DDGS() as ddgs:
        for slug, query in BRANDS:
            print(f"Searching for {slug} ({query})...")
            try:
                # Get top image results (transparent png preferred)
                results = list(ddgs.images(query + " transparent png", max_results=3))
                if not results:
                    results = list(ddgs.images(query + " logo", max_results=3))
                
                if results:
                    url = results[0]['image']
                    print(f"  Found: {url}")
                    
                    # Download it using requests
                    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
                    response = requests.get(url, headers=headers, timeout=10)
                    
                    if response.status_code == 200:
                        # Determine extension from content-type or URL
                        ext = ".png"
                        if "svg" in url.lower() or "svg" in response.headers.get("Content-Type", ""):
                            ext = ".svg"
                        elif "jpg" in url.lower() or "jpeg" in url.lower():
                            ext = ".jpg"
                        
                        out_path = os.path.join(OUT_DIR, f"{slug}{ext}")
                        with open(out_path, "wb") as f:
                            f.write(response.content)
                        print(f"  ✓ Saved to {out_path}")
                    else:
                        print(f"  ✗ Failed to download: HTTP {response.status_code}")
                else:
                    print("  ✗ No results found.")
            except Exception as e:
                print(f"  ✗ Error: {e}")

if __name__ == "__main__":
    download_logos()
