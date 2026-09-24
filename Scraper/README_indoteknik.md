# Indoteknik product scraper

Scrapes public category listings from `https://indoteknik.com` and downloads
the **primary listing image** of each product (normally 512 px). It does not
collect stock, detail-page descriptions/specifications, or additional gallery images.

## Run on this Windows machine

From the repository root:

```powershell
& .\Scraper\.venv\Scripts\python.exe -u .\Scraper\indoteknik_scraper.py
```

Output always defaults to `Scraper/indoteknik_output`, regardless of the terminal directory:

- `indoteknik_catalog.xlsx`: Products, Brands, Categories, Product Categories.
- `indoteknik_products.csv`: one row per unique product.
- `images/<product_id>.<extension>`: downloaded primary images.
- `catalog.sqlite3`: authoritative data and resumable page checkpoints.
- `state.json`: counts at the latest export.

Fields include product ID, name, brand, price, price including PPN when explicitly
shown, product URL, image URL, relative local image path, image status, and all
discovered category relationships. Prices are read from the site, not calculated.
Categories are the categories through which each product was found.

`image_status=downloaded` means a product image was downloaded;
`source_placeholder` identifies the verified site-provided "Image belum tersedia"
image. `missing_url`, `skipped`, and `failed: ...` are not successful downloads.
Other placeholder variants may require additional known hashes.

Progress is committed after **each page**. CSV/Excel are refreshed after the first
page, every 10 pages, and when the process finishes or receives Ctrl+C. If forcibly
terminated, rerun to resume from the last committed page. Do not run two crawls
against the same output directory simultaneously. Close Excel if it locks the output.

## Options

```powershell
# Smoke test: two pages; remaining pages stay pending for the next run.
& .\Scraper\.venv\Scripts\python.exe .\Scraper\indoteknik_scraper.py --max-categories 1 --max-pages-per-category 2

# One category (repeat --category-url for more).
& .\Scraper\.venv\Scripts\python.exe .\Scraper\indoteknik_scraper.py --category-url 'https://indoteknik.com/shop/category/helm-safety-2042'

# Regenerate CSV/Excel from checkpoints without visiting the website.
& .\Scraper\.venv\Scripts\python.exe .\Scraper\indoteknik_scraper.py --export-only

# Retry failed/skipped image URLs without recrawling product pages.
& .\Scraper\.venv\Scripts\python.exe .\Scraper\indoteknik_scraper.py --retry-images
```

Use `--force` to revisit selected categories from page 1 (existing records are
updated and images reused). `--output-dir PATH` selects a separate dataset.
`--no-images` collects URLs without downloading. `--delay 1` is the default
pause between listing pages; image downloads use at most three simultaneous requests.

Failed pages remain pending with an error in the Categories sheet/database.
Empty/unrecognized listing pages are deliberately left pending rather than silently
marked complete. Category discovery uses the public site's navigation; completeness
depends on the site's exposed categories and pagination.

## Fresh installation

```powershell
py -3.11 -m venv Scraper/.venv
& .\Scraper\.venv\Scripts\python.exe -m pip install -r Scraper/requirements_indoteknik.txt
& .\Scraper\.venv\Scripts\python.exe -m playwright install chromium
```

## Website sample (100 products)

`prepare_storefront_sample.py` selects 10 products from each of 10 source categories
and generates `Scraper/storefront_sample_products.json` for Supabase import.
Source URLs and tax prices are retained in
`Scraper/storefront_sample_sources.json`. The scraper database is opened read-only.
Prices are the scraped base prices; stock and specifications are not inferred.
`IND-` codes are local identifiers, and `unit` is a generic request unit, not a verified pack size.

The website reads the catalog and images from Supabase in development and production.
See `README_supabase_import.md` for importing. To regenerate the import input:

```powershell
& .\Scraper\.venv\Scripts\python.exe Scraper\prepare_storefront_sample.py
```

## Progress log

Monitor a running crawl and save its log lines together with readable tqdm
snapshots (on count changes and every 30 seconds):

```powershell
& .\Scraper\.venv\Scripts\python.exe Scraper\monitor_indoteknik.py --log Scraper\indoteknik_resume_20260923_093537.log --output-log Scraper\indoteknik_progress.log
```

The output log must differ from the source log. `--log-interval` sets the snapshot
interval in seconds. The default 70,000-product target is a monitoring target,
not a verified catalog total. Stop the monitor with Ctrl+C when finished.

## Scraper tests

```powershell
Set-Location Scraper
& .\.venv\Scripts\python.exe -m unittest -v test_indoteknik_scraper.py
```

Tests cover discounted prices versus vouchers/tax, banner exclusion, URL
deduplication, consecutive pagination, checkpoint resume, category relationships,
image response validation, and Excel output.
