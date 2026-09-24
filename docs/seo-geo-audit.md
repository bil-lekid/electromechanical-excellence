# SEO / GEO audit and implementation plan

Audit date: 2026-09-23. Tracker: [SEO_GEO_TODO.md](../md/SEO_GEO_TODO.md).
Scope: repository changes and read-only checks. No production deployment,
Supabase changes, DNS, email routing, certificates, contact destination changes,
or search-account actions are authorized by this project.

## Baseline inventory

- React 18 + TypeScript + Vite 5, BrowserRouter, client-side `createRoot`.
  `src/App.tsx`, `src/main.tsx`, `vite.config.ts`, `package.json`.
- Lovable project/deployment documented in `README.md`. No hosting-specific rewrite,
  certificate, security-header or CI deployment configuration is in the repository.
- Public routes: `/`, `/products`, `/products/:id`, `/brands`, `/about`, `/contact`,
  `/company-profile`, `/customers`, `/careers`, `/terms`, `/privacy`, `/help`,
  `/forms/{quotation,sales-visit,service-visit,payment-terms,support-letter,partner}`,
  `/help/{payment,shipping,shopping,quotation,returns,warranty,pickup}`.
- Utility/private routes: `/tracking`, `/cart`, `/auth`, `/account`, `/admin`.
  Account/admin use `ProtectedRoute`; Supabase RLS and the RFQ RPC provide actual
  access controls. Robots is not an access-control mechanism.
- Supabase is the live product source. The prior import contains 44,801 unique
  source IDs, 43,836 downloaded images and 965 items without a photo. These are
  scraped supplier listings, not an owner-reviewed editorial SEO catalog.
  Source URLs and image watermarks do not establish publication rights or
  manufacturer authorization. Do not mass-generate indexed pages from this import.
- Catalog pagination, indexed search, lazy route loading and cart-specific queries
  were implemented in the preceding task. Preserve them; see
  [catalog-performance.md](catalog-performance.md) for measured evidence.
- RFQ/cart submits `submit_quote` only when authenticated. Public service forms
  prepare a WhatsApp message; the user sends it. Tracking prepares an enquiry,
  not a public order-status lookup. No RFQ/customer content should enter static HTML.
- Existing contacts: `tel:+62216246441`, `mailto:sales@primaputraperkasa.com`,
  `https://wa.me/6287885572522`. Preserve destinations. Owner verification of
  ownership, address, opening hours and legal identity is still required.
- No active GA/GTM/other analytics implementation found. About has an in-place
  Indonesian/English toggle; there are no separate translated URLs. No article
  publishing system is connected to current routes; legacy unmounted files exist.

## Findings → impact → evidence → fix → status

| Priority | Finding and impact | Evidence | Proposed fix / status |
| --- | --- | --- | --- |
| P0 | Non-www HTTPS certificate mismatch blocks safe crawling/visits. HTTP non-www serves 200; HTTP www redirects to HTTP non-www; HTTPS www serves 200 but points canonical at failing HTTPS non-www. | `artifacts/seo-live-audit.json`; strict TLS fetch returns `ERR_TLS_CERT_ALTNAME_INVALID` for non-www. | **OWNER:** approve intended host, repair TLS and HTTPS/host redirects in existing hosting. Retain current configured origin in code; do not infer that www is the desired new domain. |
| P0 | Nearly every route has the homepage title, description and canonical. | `index.html`, only `InformationPages.tsx` sets per-page title, with an inconsistent cleanup title. | Central route metadata and one canonical policy shared by build/runtime; implementation pending. Live canonical correctness remains blocked by host issue. |
| P0 | Initial HTML has an empty root and no H1. Browser-only catalog content limits search/AI access. | `index.html`, `src/main.tsx`; live HTTP/www HTML H1 count 0. | Build-time render existing React routes, without a framework migration. Prerender only reviewed public/static routes and approved products; pending. |
| P0 | LocalBusiness schema claims official distribution, precise coordinates, founded date, coverage and other unverified facts. | `index.html` JSON-LD and description. | Replace with minimal factual Organization/BreadcrumbList; omit unsupported fields. Product schema must require editorial approval; pending. |
| P0 | Public legal identity conflicts: planning docs say PT, site says CV. | `md/CODEX_PROMPT.md`, About/footer/profile, HTML head. | Use existing unambiguous brand in new metadata; **OWNER VERIFY** legal entity. Do not invent a legal conversion. |
| P0 | The sitemap includes tracking and has no content review policy. Private/utility/search pages inherit indexable homepage head. | `public/sitemap.xml`, `public/robots.txt`, `StoreLayout.tsx`. | Generated sitemap from indexable route registry; route-specific noindex for private, utility, search and unreviewed imported products. Keep authenticated routes protected. Pending. |
| P1 | False English hreflang URL and generic Lovable share image. | `index.html` (`?lang=en` has no URL locale implementation). | Remove false hreflang, preserve actual language toggle, use an existing local image with honest alt text. Pending. |
| P1 | About/home contain unsupported authorized-distributor, stock, delivery and historical claims. Customer names appear without a recorded publication approval. | `LanguageContext.tsx`, `StoreHome.tsx`, `InformationPages.tsx`, `index.html`. | Remove unsupported authorization/promises from active content; hold customer-reference publication pending approval; record historical/address/PDF review separately. Pending. |
| P1 | Search filters use query URLs; pagination buttons aren't crawlable links; product breadcrumb only links home. | `ProductsPage.tsx`, `StoreUI.tsx`. | Preserve existing URLs, add real page/category/product links and consistent breadcrumbs. Do not create thousands of slug aliases. Pending. |
| P1 | Approved product content fields/workflow absent. Prices, generic units and photos came from supplier listings. | `Scraper/README_indoteknik.md`, `src/lib/store.ts`, import scripts. | Add an empty review-gated editorial overlay, validation and reusable schema. Owner supplies/approves first 5–10 real records, photos/datasheets. Pending. |
| P1 | No owned search-console/analytics baseline or consent decision in repo. | Code search; owner accounts unavailable. | Measurement plan, safe optional analytics adapter with no automatic network transmission; manual query matrix. Account setup and activation remain owner work. |
| P2 | CWV field data unavailable; dev performance was previously improved but entry bundle still >500 kB. | Prior build and local timing artifacts. | Preserve bounded queries, add image dimensions where appropriate; field CWV needs owner Search Console/CrUX/production checks. Do not claim Lighthouse or field results that were not run. |

Live evidence is a point-in-time check from this environment, not proof that Google,
Bing or OpenAI crawler IPs can pass the CDN/WAF. No TLS validation was disabled.
The web fetch tool also failed on non-www (502); direct strict-TLS results above
are the more specific diagnostic. Full bot access and real production route
status remain owner/hosting verification items.

## Execution plan

1. Establish a shared site/route SEO policy; remove unsupported head claims,
   false hreflang and private/utility sitemap entries.
2. Add build-time HTML rendering using the same React page components. Preserve
   SPA behavior, authentication, contact destinations and the Supabase data source.
3. Add truthful RFQ instructions, contextual breadcrumbs and a review-gated
   editorial product model. Do not populate approved product records without evidence.
4. Verify metadata, HTML, robots, sitemap, JSON-LD, privacy exclusions, routes,
   RFQ behavior and build/lint. Check tracker items only to the extent verified.
5. Document owner facts, host/TLS approval, deployment checks, search-account
   tasks and a dated 20-query measurement worksheet.

## Official guidance consulted

- [Google AI features](https://developers.google.com/search/docs/appearance/ai-features): ordinary SEO, accessible text, accurate structured data; no special AI file requirement.
- [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls): consistent canonical, sitemap and link signals; redirects require hosting review here.
- [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization) and [Product](https://developers.google.com/search/docs/appearance/structured-data/product): visible truthful data only; schema alone does not guarantee rich results.
- [OpenAI publisher FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq): search crawling and training are separate choices. Preserve the existing GPTBot policy.
- The supplied Bing AI Performance help URL returned a generic one-line page;
  verify the feature in the owner's Bing Webmaster Tools account and current
  official Bing documentation before claiming availability or results.

## Verification and handoff

Implementation checkpoint: 2026-09-24. The findings above are the pre-change baseline;
the following repository fixes are now implemented and verified:

| Baseline issue | Current repository status | Remaining limitation |
| --- | --- | --- |
| Shared homepage metadata and empty initial HTML | Shared SEO registry and build prerender for 29 routes; 19 indexable static URLs | Catalog/brand data and individual product specifications still require browser fetch; reviewed product MVP pending |
| Speculative LocalBusiness/distributor/language metadata | Removed; minimal Organization/BreadcrumbList and existing image used for social cards | Owner still needs to verify legacy legal identity, history, contacts, PDF and business claims |
| Sitemap includes utility/unreviewed pages | Generated from indexability registry; private utilities and imported products excluded | Production host and deployment verification outstanding |
| No route-specific indexing controls | Noindex utility/filter/product policy, noindex fallback shell and 404 document | Hosting must use static-first routes, true 404 status and query noindex rule |
| RFQ and link clarity | Contact requirements expanded; real pagination links preserve filters; customer-name wall omitted | No messages submitted to real recipients; official destination ownership unconfirmed |

Verification commands and outcomes:

- `npm.cmd run build`: passed, including prerender of 29 routes plus 404. Vite still warns about the approximately 530 kB entry chunk; this is not a measured Core Web Vitals pass.
- `npm.cmd run test:seo`: passed all 29 generated route checks, unique static metadata, one H1 per indexable route, canonical/query policy, assets, sitemap, robots, JSON-LD syntax, safe escaping and private exclusions. Evidence: `artifacts/seo-verification.json` (local ignored artifact).
- `node scripts/test-seo-browser.mjs`: passed production-artifact checks with JavaScript disabled on six representative public routes, mobile overflow, local true 404, client metadata navigation, query/auth noindex and isolated RFQ-to-WhatsApp message preparation. No message sent. Evidence: `artifacts/seo-browser-verification.json`.
- `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json`: passed.
- Targeted ESLint on `src/App.tsx`, `src/lib/seo.ts`, `src/components/RouteSeo.tsx`, `src/entry-server.tsx`, changed pages/layout, Supabase client and LanguageContext: passed with zero errors and one existing Fast Refresh warning in LanguageContext.
- `node node_modules/eslint/bin/eslint.js .`: failed (1,043 errors / 17 warnings), largely because existing configuration scans vendored `Scraper/.venv` and generated/local artifacts. Source-only lint also failed on existing empty-interface declarations in `src/components/ui/command.tsx:24` and `textarea.tsx:5`; full lint additionally flags the existing Tailwind `require` import. These files were not changed. See `artifacts/seo-src-lint.json`; full repository lint is **not** claimed clean.
- With local Vite preview on port 8083, `CATALOG_TEST_BASE=http://127.0.0.1:8083 CATALOG_TEST_NO_DEMO=1 node scripts/test-storefront-browser.mjs` (set variables using PowerShell `$env:`): passed mocked catalog search/filter, detail/quantity, persisted cart, login return, failed-submit preservation, successful mocked RFQ payload, private history/admin guard, bilingual About and mobile navigation. Supabase requests were intercepted; no real RFQ was created.
- `node scripts/test-catalog-performance.mjs` with approved read-only network access: passed live pagination/order/cache, search/sort/availability, literal wildcard handling, empty/out-of-range/invalid product paths, detail/cart persistence, facets and mobile checks. Observed 44,801 products, largest product response 12, cold catalog 3,911 ms, search 870 ms and cached next-page 87 ms; no browser errors. These are single local runs, not production latency guarantees. Evidence: `artifacts/catalog-performance-checks.json`.

The first regression attempts exposed obsolete heading/button selectors after intentional semantic changes; tests were updated to the new heading/anchor roles. Prerender also exposed a loading `aria-busy` mismatch, now fixed. An initial live catalog run was blocked by sandbox network restrictions; that result is not evidence of an API or catalog failure.

Read-only production evidence: `artifacts/seo-live-audit.json`. In addition to the
canonical-host TLS failure, HTTPS www deep routes `/about`, `/contact`, `/products`
and a representative product returned HTTP 404. No live-production acceptance
criterion is checked off on the strength of a local routing fixture.

See [handoff](seo-geo-handoff.md) for the deployment routing contract, owner
facts/product approvals, account setup and privacy-aware measurement plan, and
[manual query worksheet](seo-geo-query-tests.md) for 20 untested candidate prompts.

Netlify follow-up: after the user tentatively identified Netlify, added local
`netlify.toml` with `npm run build`, publish directory `dist`, non-forced
`/products/:id` rewrite to the noindex application shell, and non-forced 404
fallback. Build and all 29 generated-route SEO checks passed again. Configuration
was reviewed against Netlify's documented file-shadowing rules, but was not run
on Netlify or deployed. A standalone TOML-parser check could not run because the
local Python installation is unavailable; do not interpret generated-HTML tests
as a Netlify runtime test. Certificate repair remains a separate owner task.
Production deployment, host repair, index coverage, Search Console/Bing accounts,
product approvals, contact ownership and any new analytics consent decision are
not completed by repository edits.
