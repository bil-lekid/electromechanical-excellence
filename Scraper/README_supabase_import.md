# Import the 100 selected products to Supabase

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
