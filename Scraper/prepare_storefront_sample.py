"""Prepare 100 scraped products for import into Supabase (not bundled in the website)."""
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'Scraper/indoteknik_output'
GROUPS = [
    ('Multimeter', 'Komponen Elektrikal'),
    ('Clamp Meter', 'Komponen Elektrikal'),
    ('Electro Motors', 'Motor & Pompa'),
    ('Centrifugal Pump', 'Motor & Pompa'),
    ('Submersible Pump', 'Motor & Pompa'),
    ('Wrench', 'Perkakas & Safety'),
    ('Toolset', 'Perkakas & Safety'),
    ('Helm Safety', 'Perkakas & Safety'),
    ('Sarung Tangan Safety', 'Perkakas & Safety'),
    ('Meteran', 'Perkakas & Safety'),
]


def main():
    db = sqlite3.connect((OUTPUT / 'catalog.sqlite3').as_uri() + '?mode=ro', uri=True)
    db.row_factory = sqlite3.Row
    selected = []
    seen = set()
    for source_category, category in GROUPS:
        rows = db.execute('''SELECT p.* FROM products p
            JOIN relationships r ON r.product_url=p.product_url
            JOIN categories c ON c.url=r.category_url
            WHERE c.name=? AND p.image_status='downloaded' AND p.price>0
            ORDER BY p.product_name, p.product_id''', (source_category,)).fetchall()
        count = 0
        for row in rows:
            image = OUTPUT / row['image_local_path']
            if row['product_id'] in seen or not image.is_file():
                continue
            selected.append((dict(row), category, source_category, image))
            seen.add(row['product_id'])
            count += 1
            if count == 10:
                break
        if count != 10:
            raise RuntimeError(f'{source_category}: only {count} usable products; expected 10')
    db.close()
    products, sources = [], []
    timestamp = datetime.now(timezone.utc).isoformat()
    for index, (row, category, source_category, image) in enumerate(selected):
        products.append(dict(
            id=f"indoteknik-{row['product_id']}", name_id=row['product_name'], name_en='',
            description_id=None, category=category, brand=row['brand'] or None,
            image_url=f'/catalog/indoteknik/{image.name}', is_featured=index in (0, 20, 50, 70),
            created_at=timestamp, updated_at=timestamp, sku=f"IND-{row['product_id']}",
            price_idr=row['price'], unit='unit', availability='on_request',
            specifications={}, is_active=True,
        ))
        sources.append(dict(product_id=row['product_id'], product_url=row['product_url'],
                            source_category=source_category, image_url=row['image_url'],
                            price_incl_ppn=row['price_incl_ppn']))
    (ROOT / 'Scraper/storefront_sample_products.json').write_text(json.dumps(products, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (ROOT / 'Scraper/storefront_sample_sources.json').write_text(json.dumps(sources, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Prepared {len(products)} products from {len(GROUPS)} source categories for Supabase import.')


if __name__ == '__main__':
    main()
