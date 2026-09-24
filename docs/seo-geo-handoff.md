# SEO / GEO handoff — 2026-09-24

## Implemented in the repository

- `src/lib/seo.ts` is the shared metadata/indexability registry for build-time HTML and client navigation. Titles, descriptions, canonical paths, Open Graph/Twitter cards and limited Organization/BreadcrumbList JSON-LD no longer inherit homepage metadata everywhere. Sharing uses an existing industrial image, not a claimed PPP facility photo.
- `npm run build` builds Vite, then prerenders the existing React components into 29 route documents and a 404 document. Public headings, navigation, company copy, procurement guides and RFQ forms exist without JavaScript. No framework migration or database reads/writes are required at build time. Catalog results and brand lists still load through bounded API queries; unapproved product specifications are **not** prerendered.
- Sitemap generation includes 19 static indexable URLs. Account, admin, authentication, cart, tracking, unreviewed company support pages and every imported product are excluded. No fictitious modification dates. Filter/search/pagination pages use `noindex,follow` with a query-specific canonical; tracking parameters are omitted. Base catalog remains indexable. Product pages deliberately remain unindexed pending editorial approval.
- Robots explicitly allows Googlebot, Bingbot and OAI-SearchBot. The existing wildcard Allow policy, including its effect on GPTBot, is unchanged. Robots is not security; existing authentication/RLS remain required.
- Removed unsupported distributor claims from the global head and legacy translation labels, false language alternates, speculative LocalBusiness details and public customer-name wall. Contact destinations remain unchanged. Existing legal name, founding-year, address/hours, PDF and other legacy business claims still require owner confirmation; this is not a completed factual-content audit.
- Contact copy now states the product, part number, specifications, quantity/unit, destination and deadline needed for RFQs. Catalog pagination uses real links and preserves filters. Existing forms still require user action to send.

## Owner decisions before deployment (P0)

1. Confirm legal/public identity: planning files say **PT**, current UI says **CV**. New metadata uses the neutral brand **Prima Putra Perkasa**. Confirm existing address, telephone, WhatsApp, email, operating hours, 2003 founding date, PDF content/publication rights, customer/principal references and any distributor claims. No new business facts were invented. _just use CV Prima Putra Perkasa, everything is good_
2. Choose canonical host and approve hosting repair. Read-only audit on September 23 found `https://primaputraperkasa.com/` failing `ERR_TLS_CERT_ALTNAME_INVALID`; `https://www.primaputraperkasa.com/` returned 200, but `/about`, `/contact`, `/products` and a representative product returned 404. HTTP did not consistently redirect to HTTPS. The registry preserves the existing non-www canonical intent; it does **not** certify that hostname as healthy. Do not submit the sitemap until this is fixed.
3. Approve deployment through the existing process after reviewing changes. No DNS, certificate, CDN/WAF, Supabase, email or production deployment changes were made for this SEO task.

## Deployment routing contract

Use `npm ci` then `npm run build` with existing public `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Do not place administrative tokens in Vite variables. Publish only `dist`, never repository root, `.env*`, `artifacts`, scraper data or source documents with private information.

Hosting must serve the generated route documents before any SPA fallback. Serve `/about` from `dist/about/index.html`, for example. Preserve extensionless canonical paths and approve permanent host/HTTPS/trailing-slash redirects separately. For existing unreviewed `/products/:id` URLs, serve `dist/app-shell.html` (noindex); do not fall back to the prerendered homepage. Unknown routes should serve `dist/404.html` with HTTP **404**, not 200. Query-based catalog pages require a hosting rule returning `X-Robots-Tag: noindex, follow` or the noindex app shell for meaningful filters (`q`, `category`, `brand`, `sort`, `page`, `ready`); client metadata alone is not an HTTP-level guarantee. Do not apply this header to tracking-only queries or the base catalog.

`netlify.toml` now prepares the build command (`npm run build`), publish directory (`dist`), non-forced product-detail rewrite to `app-shell.html`, and non-forced 404 fallback. Netlify's file shadowing lets existing prerendered pages and assets take priority. This configuration is local and **has not been deployed**; the user tentatively identified Netlify, so confirm the actual site/repository before deploying. The query-specific noindex hosting rule described above remains pending. Vite's generic preview fallback does not prove production routing is configured. `scripts/test-seo-browser.mjs` uses an isolated static-first routing fixture to verify generated artifacts and explicitly tests a true 404.

For Netlify: use the repository root as the base directory and retain the existing public Supabase build variables. If uploading manually, build first and upload `dist`; dashboard drag-and-drop does not run the repository build or consume root `netlify.toml`. Prefer a connected-repository deploy so these routing rules are included. Review the deploy log and test direct navigation and refresh on `/about`, `/contact`, `/products` and an existing product UUID. Check an unknown path returns 404. Certificate/domain settings are separate from these routing changes. Reference: [Netlify rewrites and file shadowing](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/).

After approval/deployment:

```powershell
node scripts/audit-seo-live.mjs
curl.exe -I https://primaputraperkasa.com/
curl.exe -I https://primaputraperkasa.com/about
curl.exe -I https://primaputraperkasa.com/does-not-exist
curl.exe -A Googlebot https://primaputraperkasa.com/robots.txt
curl.exe -A Bingbot https://primaputraperkasa.com/robots.txt
curl.exe -A OAI-SearchBot https://primaputraperkasa.com/robots.txt
curl.exe https://primaputraperkasa.com/sitemap.xml
```

Do not disable TLS verification. Check initial source and mobile rendering for home, About, contact, quotation guide/form, catalog and an approved product. User-agent requests only test that header; verify real crawler access through Search Console/Bing URL inspection and CDN logs. Validate structured data with Google's tools after deployment; no rich-result eligibility is promised. Current schema intentionally has no Product, Offer, reviews, ratings, LocalBusiness or invented author/date.

## Product publication gate (P1)

The imported 44,801 records are operational catalog data, not approved SEO pages. Keep existing UUID URLs and Supabase as the operational source; do not create a second invented catalog. Owner: choose 20–30 priorities, then approve 5–10 real products with photo/datasheet rights. A future reviewed-content record should reference the existing product UUID and contain:

| Field                                                 | Publication requirement                                                                               |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Name, category, brand, manufacturer model/part number | Owner-approved values with source; omit unknown brand/model                                           |
| Summary, alternate Indonesian/English terms           | Specific human-reviewed copy; no automatic mass translations                                          |
| Dimensions, material, units, application, standards   | Label/value/unit plus verified manufacturer source; omit unknowns                                     |
| Photo and datasheet URL                               | Explicit permission/license and source; no unapproved supplier watermarks                             |
| Review                                                | Reviewer, actual review date, approval status and evidence reference (private evidence stays private) |
| Commercial data                                       | Existing operational source only; never infer stock/price/guarantee from import                       |

Implement the reusable reviewed-content overlay, specification table, matching Product JSON-LD and product prerender/sitemap entries once approved records are available. That code and publication task remain open; the current safeguards do not count as completed product MVP. Do not rename UUID routes without reviewed redirect mappings.

## Measurement and accounts

No analytics script was detected or installed. Owner must choose the analytics account, consent/privacy policy and retention before activation. Measure organic landing **paths** and successful `submit_quote` completion (not button clicks); use only aggregate item count. Classify WhatsApp/email clicks by channel and page path. Never send RFQ text, names, email, phone, account IDs, search text, query strings or the WhatsApp message URL to analytics. Separate prepared messages, outbound clicks and confirmed qualified RFQs; a WhatsApp click is not a sent message.

Primary proposed KPI: qualified organic RFQs per month. Secondary: relevant search impressions/clicks, indexed approved pages and product-to-RFQ progression. Confirm definitions and attribution with owner; no baseline data is available. Verify Search Console and Bing Webmaster Tools, submit the healthy canonical sitemap and inspect representative URLs. Owner should check Bing AI Performance if available in the account, plus real public profiles and eligible Google Business Profile details. Do not manufacture profiles or citations.

Review search/RFQ data monthly over multiple months, logging deployments and other campaigns. Use [the manual worksheet](seo-geo-query-tests.md) separately; occasional model mentions are not evidence of ranking improvement. IndexNow, bilingual URLs/hreflang and llms.txt are deferred until crawlability, verified content and owner maintenance capacity are established.
