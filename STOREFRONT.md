# Prima Putra Perkasa storefront

The website now supports product discovery, cart and B2B quotation requests.
Company history, services, address and contact details come from the original
website. About Us retains the original Indonesian/English company descriptions.
The storefront interface is Indonesian.

## Available flows

- `/`: storefront with category navigation, featured products and company summary.
- `/products`: keyword/SKU/brand search, category and brand filters, availability,
  price/name sorting and pagination. Filters remain in the URL.
- `/products/:id`: description, specifications, reference price, quantity selector.
- `/brands`, `/about`, `/contact`: discovery and company information.
- `/cart`: persistent quantities, removal, validated contact form and quotation
  submission after login. Unknown prices are explicitly excluded from the priced
  subtotal; tax, shipping and final commercial terms are confirmed by sales.
- `/auth`, `/account`: Supabase signup/login and private quotation history.
- `/admin`: product creation/editing/hiding and quotation review/status updates.
  Admin roles are assigned by a trusted database administrator, never at signup.

The flow uses request-for-quotation, pending the owner's decision on checkout.
No payment is collected and no order is represented as paid or confirmed.
Payment gateways, courier rates, tax invoices, credit terms and organization
approval chains have not been integrated. Status changes do not send notifications.

## Supabase deployment prerequisite

The configured project's hostname returned `ENOTFOUND` on 2026-09-14. The database
was not opened successfully and no remote migration was executed. To connect:

1. Verify the active project in the Supabase dashboard and restore it if necessary.
2. Put its URL and publishable/anon key in local `.env` and deployment settings.
   Keep service-role keys and database credentials out of `VITE_*`.
3. Review and apply all migrations in order, including
   `supabase/migrations/20260914090000_storefront.sql`, to the intended project.
   Verify migration history before applying; do not replay the initial public-write
   migration alone. The complete chain is required.
4. Configure Auth email confirmation, email delivery, site URL, and allowed redirects
   including `/account`. Enforce the password policy server-side as well (the signup
   form requires 12 characters). Configure Auth rate limits/CAPTCHA as appropriate.
5. Create the operator's account, then assign `admin` in `public.user_roles` using a
   trusted database session. Customers must not receive this role.
6. Open `/admin` to enter actual product names, SKUs, descriptions, HTTPS image URLs,
   specifications, prices and availability. No sample data is seeded into SQL.
7. Verify real anonymous/customer/admin behavior and regenerate database types.
   `store-types.ts` currently describes the checked-in migration, not a live schema.

The `submit_quote` RPC creates a request and item snapshots atomically. It derives
the owner/email from Auth, resolves names/prices from products, rejects unavailable
or hidden products, bounds quantities, limits request size and frequency, and
supports an idempotency token. Clients cannot write request ownership, contact
snapshots, item prices or statuses directly. Only admin may update status. RLS
limits request/item reads to the owner and admin. The role helper only checks the
current user rather than arbitrary account IDs.

## Local preview and verification

`npm run dev` uses Supabase. For a design preview while the database is unavailable,
set `VITE_CATALOG_DEMO=true` in `.env.local` and restart Vite. A visible banner labels
the sample catalog and quote submission is disabled. Production builds ignore this
preview flag and never silently replace failed API requests with sample data.
Preview products have no invented prices or inventory counts; category illustrations
are explicitly labeled. Replace them with actual catalog photography via admin.

Build/type checks:

```sh
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Additional QA tools are isolated from application dependencies:

```sh
npm install --prefix node_modules/.ppp-qa --no-save --package-lock=false --ignore-scripts playwright @electric-sql/pglite
node scripts/test-storefront-db.mjs
```

The DB test runs the entire migration chain against ephemeral PostgreSQL (PGlite)
with a minimal mock of Supabase Auth roles. It tests RLS, role escalation, atomic
rollback, authoritative price/email snapshots, idempotency and rate limiting.
This verifies SQL behavior, not remote project configuration.

`scripts/test-storefront-browser.mjs` uses local Google Chrome, a demo Vite server
on 8081 and a real-API-mode Vite server on 8082. All Supabase requests are intercepted
with test responses. It covers search/filter, cart persistence, login return,
failure recovery, quote payloads/history, admin guards, About translations and
mobile layout. Screenshots are saved under ignored `artifacts/`.

The current catalog provider fetches active products in batches and filters in the
browser. For a large catalog, move filtering/search/pagination to an indexed server
query and fetch cart/detail products by ID. This version does not claim the catalog
scale of the reference retailers.

## Reference direction

The category-led catalog and B2B quotation flow are informed by
[Indoteknik](https://indoteknik.com/) and [Monotaro](https://www.monotaro.id/).
Company content and branding remain Prima Putra Perkasa's; neither competitor's
product data nor their commercial terms were imported.
