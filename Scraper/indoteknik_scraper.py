#!/usr/bin/env python3
"""Scrape public Indoteknik listings and primary images, with resumable checkpoints."""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import re
import sqlite3
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urljoin, urlsplit, urlunsplit

import pandas as pd
from playwright.async_api import async_playwright

BASE_URL = 'https://indoteknik.com'
CARD = 'div.rounded.shadow-sm:has(a[href*="/shop/product/"][title])'
FIELDS = ['product_id', 'product_name', 'brand', 'price', 'price_incl_ppn',
          'product_url', 'image_url', 'image_local_path', 'image_status']
# Verified site-supplied "Image belum tersedia" image; do not count as a product photo.
PLACEHOLDER_HASHES = {'aec1a76aa5da9e11dc5e8390e40d1158ebe7aecf53e3400270bf4bbda7432645'}


def normalize_url(value, *, product=False):
    parts = urlsplit(urljoin(BASE_URL, value))
    host = 'indoteknik.com' if parts.hostname == 'www.indoteknik.com' else parts.netloc
    query = {} if product else {k: v for k, v in parse_qs(parts.query).items()
                               if not k.startswith('utm_') and k != 'slug'}
    if query.get('page') == ['1']:
        query.pop('page')
    return urlunsplit(('https', host, parts.path.rstrip('/') or '/', urlencode(query, doseq=True), ''))


def category_url(value):
    url = normalize_url(value)
    parts = urlsplit(url)
    if parts.hostname != 'indoteknik.com' or not parts.path.startswith('/shop/category/'):
        raise ValueError(f'Not an Indoteknik category URL: {value}')
    return url


def database(output):
    output.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(output / 'catalog.sqlite3')
    db.execute('PRAGMA journal_mode=WAL')
    db.executescript('''
        CREATE TABLE IF NOT EXISTS products (
            product_id TEXT, product_name TEXT, brand TEXT, price INTEGER,
            price_incl_ppn INTEGER, product_url TEXT PRIMARY KEY, image_url TEXT,
            image_local_path TEXT, image_status TEXT);
        CREATE TABLE IF NOT EXISTS categories (
            url TEXT PRIMARY KEY, name TEXT, next_url TEXT, done INTEGER DEFAULT 0,
            error TEXT DEFAULT '');
        CREATE TABLE IF NOT EXISTS relationships (
            product_url TEXT, category_url TEXT,
            PRIMARY KEY(product_url, category_url));
    ''')
    return db


def export(db, output):
    products = pd.read_sql_query('SELECT * FROM products ORDER BY product_name', db)
    relationships = pd.read_sql_query('''SELECT r.product_url, c.name AS category,
        c.url AS source_category_url FROM relationships r JOIN categories c
        ON c.url = r.category_url ORDER BY r.product_url, c.name''', db)
    if not relationships.empty:
        cats = relationships.groupby('product_url')['category'].agg(lambda s: ' | '.join(sorted(set(s))))
        products['all_categories'] = products['product_url'].map(cats)
    else:
        products['all_categories'] = ''
    categories = pd.read_sql_query('SELECT * FROM categories ORDER BY name', db)
    brands = products[['brand']].drop_duplicates().sort_values('brand')
    csv_file = output / 'indoteknik_products.csv'
    products.to_csv(csv_file.with_suffix('.tmp'), index=False, encoding='utf-8-sig')
    try:
        csv_file.with_suffix('.tmp').replace(csv_file)
    except PermissionError:
        print('CSV is locked; snapshot saved as indoteknik_products.tmp.', flush=True)
    workbook = output / 'indoteknik_catalog.xlsx'
    temporary = output / 'indoteknik_catalog.tmp.xlsx'
    try:
        with pd.ExcelWriter(temporary, engine='openpyxl') as writer:
            for name, frame in [('Products', products), ('Brands', brands),
                                ('Categories', categories), ('Product Categories', relationships)]:
                frame.to_excel(writer, sheet_name=name, index=False)
                ws = writer.book[name]
                ws.freeze_panes = 'A2'
                ws.auto_filter.ref = ws.dimensions
                for column in ws.columns:
                    ws.column_dimensions[column[0].column_letter].width = min(55, max(14,
                        max(len(str(cell.value or '')) for cell in column[:100]) + 2))
                    for cell in column:
                        if cell.data_type == 'f':
                            cell.data_type = 's'
        temporary.replace(workbook)
    except PermissionError:
        print('Excel is locked; close it before the next export. Database is saved.', flush=True)
    state = {'products': len(products), 'categories': len(categories),
             'completed_categories': int(categories['done'].sum()),
             'images_downloaded': int(products['image_status'].eq('downloaded').sum())}
    state_file = output / 'state.json'
    state_file.with_suffix('.tmp').write_text(json.dumps(state, indent=2), encoding='utf-8')
    state_file.with_suffix('.tmp').replace(state_file)
    print(f'Export: {state}', flush=True)


async def navigate(page, url, ready):
    for attempt in range(3):
        try:
            response = await page.goto(url, wait_until='domcontentloaded', timeout=60000)
            if response and response.status >= 400:
                raise RuntimeError(f'HTTP {response.status}: {url}')
            await page.wait_for_selector(ready, state='attached', timeout=45000)
            return
        except Exception:
            if attempt == 2:
                raise
            await asyncio.sleep(2 ** (attempt + 1))


async def discover(page, start):
    await navigate(page, start, 'a[href*="/shop/category/"]')
    await page.wait_for_function('''() => Array.from(document.querySelectorAll('a[href*="/shop/category/"]'))
        .some(a => a.textContent.trim().length > 0)''', timeout=45000)
    links = await page.locator('a[href*="/shop/category/"]').evaluate_all(
        '(els) => els.map(a => ({url:a.href, name:a.textContent.trim()}))')
    return {category_url(x['url']): x['name'] for x in links if x['name'] and x['name'] != 'Lihat Semua'}


async def extract(page):
    await page.wait_for_function('''selector => Array.from(document.querySelectorAll(selector))
        .some(card => /Rp/.test(card.innerText))''', arg=CARD, timeout=45000)
    # Listing images are only mounted when scrolled into view.
    cards = page.locator(CARD)
    count = await cards.count()
    for index in range(0, count, 4):
        await cards.nth(index).scroll_into_view_if_needed()
        await page.wait_for_timeout(180)
    if count:
        await cards.nth(count - 1).scroll_into_view_if_needed()
    await page.wait_for_timeout(400)
    raw = await cards.evaluate_all(r'''els => els.map(card => {
        const title = card.querySelector('a[href*="/shop/product/"][title]');
        const brand = card.querySelector('a[href*="/shop/brands/"]');
        const priceText = title.nextElementSibling?.innerText || '';
        const tax = priceText.match(/Inc\.?\s*PPN\s*:\s*Rp\s*([\d.]+)/i);
        const beforeTax = priceText.split(/Inc\.?\s*PPN/i)[0];
        const basePrices = [...beforeTax.matchAll(/Rp\s*([\d.]+)/g)];
        const image = card.querySelector('img.gambarA');
        return {product_name:title.textContent.trim(), brand:brand?.textContent.trim() || '',
            product_url:title.href, price:basePrices.length ? Number(basePrices.at(-1)[1].replaceAll('.', '')) : null,
            price_incl_ppn:tax ? Number(tax[1].replaceAll('.', '')) : null,
            image_url:image?.currentSrc || image?.src || ''};
    })''')
    unique = {}
    for row in raw:
        row['product_url'] = normalize_url(row['product_url'], product=True)
        match = re.search(r'-(\d+)$', urlsplit(row['product_url']).path)
        row['product_id'] = match[1] if match else hashlib.sha256(row['product_url'].encode()).hexdigest()[:16]
        row.update(image_local_path='', image_status='pending')
        unique[row['product_url']] = row
    if not unique:
        raise RuntimeError('No product cards found; page remains pending.')
    return list(unique.values())


async def next_page(page):
    current = int(parse_qs(urlsplit(page.url).query).get('page', ['1'])[0])
    links = await page.locator('.pagination a[href]').evaluate_all(
        '(els) => els.map(a => ({text:a.textContent.trim(), href:a.href}))')
    for link in links:
        if link['text'] == str(current + 1):
            candidate = category_url(link['href'])
            if urlsplit(candidate).path != urlsplit(page.url).path:
                raise RuntimeError('Pagination points to a different category')
            return candidate
    if any(x['text'].isdigit() and int(x['text']) > current for x in links):
        raise RuntimeError('Pagination has later pages but no next page link')
    return None


def image_extension(data):
    if data.startswith(b'\xff\xd8\xff'):
        return '.jpg'
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        return '.png'
    if data.startswith((b'GIF87a', b'GIF89a')):
        return '.gif'
    if data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        return '.webp'
    raise ValueError('Response is not a supported image (JPEG, PNG, GIF, WebP)')


async def download_image(request, row, output, db, semaphore):
    previous = db.execute('SELECT image_url, image_local_path, image_status FROM products WHERE product_url=?',
                          (row['product_url'],)).fetchone()
    if previous and previous[2] in ('downloaded', 'source_placeholder') and (output / previous[1]).is_file():
        row.update(image_url=previous[0], image_local_path=previous[1], image_status=previous[2])
        return
    if not row['image_url']:
        row['image_status'] = 'missing_url'
        return
    async with semaphore:
        for attempt in range(3):
            response = None
            try:
                response = await request.get(row['image_url'], timeout=45000)
                if not response.ok:
                    raise RuntimeError(f'HTTP {response.status}')
                data = await response.body()
                extension = image_extension(data)
                relative = Path('images') / (row['product_id'] + extension)
                target = output / relative
                target.parent.mkdir(exist_ok=True)
                target.with_suffix(extension + '.part').write_bytes(data)
                target.with_suffix(extension + '.part').replace(target)
                status = 'source_placeholder' if hashlib.sha256(data).hexdigest() in PLACEHOLDER_HASHES else 'downloaded'
                row.update(image_local_path=relative.as_posix(), image_status=status)
                return
            except Exception as error:
                if attempt == 2:
                    row['image_status'] = f'failed: {str(error)[:150]}'
                    print(f'Image failed {row["product_id"]}: {error}', flush=True)
                else:
                    await asyncio.sleep(2 ** attempt)
            finally:
                if response:
                    await response.dispose()


def save_page(db, rows, category, following):
    with db:
        for row in rows:
            db.execute(f'INSERT OR REPLACE INTO products ({",".join(FIELDS)}) VALUES ({",".join("?" for _ in FIELDS)})',
                       [row[x] for x in FIELDS])
            db.execute('INSERT OR IGNORE INTO relationships VALUES (?, ?)', (row['product_url'], category))
        db.execute('UPDATE categories SET next_url=?, done=?, error=? WHERE url=?',
                   (following, int(following is None), '', category))


async def run(args):
    output = args.output_dir.resolve()
    db = database(output)
    try:
        if args.export_only:
            return
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=not args.headful)
            context = await browser.new_context(viewport={'width': 1440, 'height': 1000}, locale='id-ID')
            page = await context.new_page()
            semaphore = asyncio.Semaphore(3)
            if args.retry_images:
                cursor = db.execute("SELECT * FROM products WHERE image_status NOT IN ('downloaded','source_placeholder')")
                retry_rows = [dict(zip(FIELDS, values)) for values in cursor.fetchall()]
                for row in retry_rows:
                    await download_image(context.request, row, output, db, semaphore)
                    with db:
                        db.execute('UPDATE products SET image_local_path=?,image_status=? WHERE product_url=?',
                                   (row['image_local_path'], row['image_status'], row['product_url']))
                await browser.close()
                return
            if args.category_url:
                categories = {category_url(u): re.sub(r'-\d+$', '', urlsplit(u).path.split('/')[-1]).replace('-', ' ')
                              for u in args.category_url}
            else:
                print(f'Discovering categories: {args.start_url}', flush=True)
                categories = await discover(page, normalize_url(args.start_url))
            if not categories:
                raise RuntimeError('No categories discovered')
            with db:
                for url, name in categories.items():
                    db.execute('INSERT OR IGNORE INTO categories (url,name,next_url) VALUES (?,?,?)', (url, name, url))
                if args.force:
                    for url in categories:
                        db.execute('UPDATE categories SET done=0,next_url=url,error=? WHERE url=?', ('', url))
            queue = [(u, n) for u, n in categories.items()
                     if not db.execute('SELECT done FROM categories WHERE url=?', (u,)).fetchone()[0]]
            if args.max_categories:
                queue = queue[:args.max_categories]
            print(f'Categories pending: {len(queue)}; output: {output}', flush=True)
            pages_saved = 0
            for index, (url, name) in enumerate(queue, 1):
                following = db.execute('SELECT next_url FROM categories WHERE url=?', (url,)).fetchone()[0] or url
                pages_this_run = 0
                print(f'[{index}/{len(queue)}] {name}', flush=True)
                try:
                    while following:
                        print(f'  Loading {following}', flush=True)
                        await navigate(page, following, CARD)
                        rows = await extract(page)
                        following = await next_page(page)
                        if not args.no_images:
                            await asyncio.gather(*(download_image(context.request, row, output, db, semaphore) for row in rows))
                        else:
                            for row in rows:
                                old = db.execute('SELECT image_local_path,image_status FROM products WHERE product_url=?',
                                                 (row['product_url'],)).fetchone()
                                row.update(image_local_path=old[0] if old else '', image_status=old[1] if old else 'skipped')
                        save_page(db, rows, url, following)
                        pages_saved += 1
                        pages_this_run += 1
                        print(f'  Saved {len(rows)} products; images: {sum(r["image_status"] == "downloaded" for r in rows)}', flush=True)
                        if pages_saved == 1 or pages_saved % args.export_every == 0:
                            export(db, output)
                        if args.max_pages_per_category and pages_this_run >= args.max_pages_per_category:
                            break
                        await asyncio.sleep(args.delay)
                except Exception as error:
                    with db:
                        db.execute('UPDATE categories SET error=? WHERE url=?', (str(error), url))
                    print(f'  ERROR (kept pending): {error}', flush=True)
            await browser.close()
    finally:
        try:
            export(db, output)
        finally:
            db.close()


def positive(value):
    number = int(value)
    if number < 1:
        raise argparse.ArgumentTypeError('Must be at least 1')
    return number


def build_parser():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--start-url', default=BASE_URL)
    parser.add_argument('--category-url', action='append')
    parser.add_argument('--output-dir', type=Path, default=Path(__file__).resolve().parent / 'indoteknik_output')
    parser.add_argument('--delay', type=float, default=1.0)
    parser.add_argument('--max-categories', type=positive)
    parser.add_argument('--max-pages-per-category', type=positive)
    parser.add_argument('--export-every', type=positive, default=10)
    parser.add_argument('--headful', action='store_true')
    parser.add_argument('--force', action='store_true', help='Revisit selected categories without deleting data/images')
    parser.add_argument('--no-images', action='store_true')
    parser.add_argument('--export-only', action='store_true')
    parser.add_argument('--retry-images', action='store_true', help='Retry failed/skipped downloads from saved image URLs')
    return parser


if __name__ == '__main__':
    try:
        asyncio.run(run(build_parser().parse_args()))
    except KeyboardInterrupt:
        print('Stopped. Run the same command to resume.', flush=True)
        sys.exit(130)
