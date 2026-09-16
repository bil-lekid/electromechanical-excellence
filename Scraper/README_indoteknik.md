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

## Tests

```powershell
Set-Location Scraper
& .\.venv\Scripts\python.exe -m unittest -v test_indoteknik_scraper.py
```

Tests cover discounted prices versus vouchers/tax, banner exclusion, URL
deduplication, consecutive pagination, checkpoint resume, category relationships,
image response validation, and Excel output.
