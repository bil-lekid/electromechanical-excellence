# Catalog loading and search

Apply `supabase/migrations/20260923090000_catalog_performance.sql` before deploying
the frontend. It adds a generated search document, partial indexes for active
products, and the read-only `catalog_facets()` function. Existing product RLS
continues to apply, including to the facets function (`SECURITY INVOKER`).

The migration has been applied to the current Supabase project. For another
project, run it through the SQL editor, or configure `SUPABASE_ACCESS_TOKEN` in
the ignored `.env.supabase.local` and run
`node scripts/apply-catalog-performance.mjs --apply`.

`src/hooks/useCatalog.ts` owns bounded queries:

- Home: four featured-first products.
- Catalog: 12 products, filtered/sorted in Postgres with an exact result count.
- Detail: one product by ID, plus at most four related products.
- Cart: only selected IDs; prices are refreshed when the cart is opened.
- Categories/brands: one aggregate response, cached for five minutes.
- Company/information pages: no product queries.

Search requires every whitespace-separated term to occur in the name, brand,
SKU or category. LIKE/regex metacharacters are escaped as literals. Ordering has
an ID tie-breaker so adjacent pages do not overlap; null prices remain last.
Out-of-range pages are redirected to the last valid page.

Product queries are cached for a minute. The next catalog page is prefetched;
obsolete requests are cancelled. The cart provider no longer downloads the catalog.
Admin, account, detail, cart and other secondary routes are lazy-loaded.

## Validation

Run `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json` and
`npm run build`. The browser scripts use the existing local Playwright installation
in `node_modules/.ppp-qa` and Chrome on Windows.

Start Vite on port 8083 in production mode (live public Supabase configuration),
then run `node scripts/test-catalog-performance.mjs`. This checks the live catalog
without creating orders or modifying remote products. `CATALOG_TEST_BASE` overrides
the URL. It checks paging, search, literal wildcard characters, sort/filter, cart
persistence, out-of-range pages, brands and mobile overflow.

For isolated checkout/login regression tests, set `CATALOG_TEST_BASE` to the same
URL and `CATALOG_TEST_NO_DEMO=1`, then run `node scripts/test-storefront-browser.mjs`.
All Supabase responses in this test are mocked.

`node scripts/measure-catalog-browser.mjs after` records local browser timings and
a screenshot. `node scripts/check-catalog-query-plan.mjs` saves a read-only EXPLAIN
ANALYZE using the private management token. Reports live under ignored `artifacts/`.
Local development timings depend on connection and cache state; they are not a
production latency guarantee. Deploy the new frontend build for online visitors
to receive the bounded query implementation.

## Local measurements (23 September 2026)

With the same 44,801-product Supabase catalog and desktop Chrome, initial home
product rendering changed from 23,902 ms / 90 catalog requests to 1,954 ms /
one request. The final search run (`bosch drill`) returned the same 257 matches
in 893 ms. The live regression run measured cached next-page navigation at
162 ms and confirmed no catalog product response exceeded 12 rows.
The entry JavaScript bundle dropped from 658.38 kB to 525.95 kB (uncompressed).
These are individual local development measurements, not statistical benchmarks.
