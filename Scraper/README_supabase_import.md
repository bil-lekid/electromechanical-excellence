# Import the 100 selected products to Supabase

## Full catalog import

Run `node scripts/import-indoteknik-all.mjs` to validate the SQLite catalog and
downloaded images, then add `--upload` to import all products into the same project.
Requires Node 24 (built-in SQLite) and the existing server-side service key.
Do not run multiple full imports simultaneously.

Products are deduplicated by source product ID, with downloaded-image records
preferred, then longer names and URL order as deterministic tie breakers.
Existing SKUs retain their IDs, featured flags and categories. New products use
their first alphabetically sorted source category. Prices are scraped base prices;
inventory and specifications are not inferred. Missing/placeholder images use an
empty image URL, compatible with the legacy NOT NULL column and storefront fallback.
All original source rows and category relationships are archived locally in
`artifacts/indoteknik-bulk-sources.json`.

Images are uploaded under content-addressed `catalog/` paths with 64 workers and
verified byte-for-byte through their public URLs. Products are upserted in batches
of 200 and every batch is read back through public access to verify the stored fields.
`artifacts/indoteknik-bulk-checkpoint.json` tracks verified image uploads for resume;
rerunning rechecks and upserts product batches without duplicating SKUs.
`artifacts/indoteknik-bulk-receipt.json` reports progress and marks `complete` only
after every product has passed verification. Keep the checkpoint for the same project
and clear it if remote images are manually removed. The original sample import below
is separate and limited to 100 products.

After completion, run `node scripts/verify-indoteknik-import.mjs` for a separate,
read-only public-access audit of every imported SKU, name, price, availability and
image URL. Results are saved to `artifacts/indoteknik-bulk-verification.json`.

The import reads the existing sample and downloaded images; it does not restart
the scraper. Product rows go to `public.products`, and images go to the public
`indoteknik-products` Storage bucket under `sample-100/`.

1. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.supabase.local`. The file is ignored by
   Git. Never use a `VITE_` prefix or put this key into browser code.
2. For a project with legacy `title`/`description` products, first apply
   `supabase/migrations/20260914085900_legacy_catalog_compat.sql`, then
   `supabase/migrations/20260914090000_storefront.sql` in the project's SQL Editor.
   The storefront migration adds catalog fields and quote tables and must not
   be run twice. Both migrations have already been applied to the current project.
3. Run `node scripts/import-indoteknik-supabase.mjs --upload` from the project root.

Alternatively, put `SUPABASE_ACCESS_TOKEN` in the same private file and run
`node scripts/import-indoteknik-supabase.mjs --apply-migration --upload` to apply
the migration through the Management API before the import.

Without flags, the script only validates the 100 input products and images.
The target project URL comes from the production Vite environment configuration.
Imports reuse existing rows by SKU, so retrying does not create duplicate products.
Images are uploaded and checked byte-for-byte before the product rows are written.
The final check reads all 100 imported rows using the public browser key.
The receipt is saved to `artifacts/supabase-import-receipt.json` without credentials.

The website now reads the products from Supabase in development and production.
Its image URLs point to Supabase Storage. The input sample is kept in
`Scraper/storefront_sample_products.json` solely for repeatable imports and is not
part of the frontend build. Original scraper images remain in
`Scraper/indoteknik_output/images`; no copied product images are shipped in `public`.

The import does not invent inventory or specifications. `IND-` is an internal
source identifier; prices are the scraped base prices and `unit` is generic.
