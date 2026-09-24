# PT Prima Putra Perkasa — SEO & GEO Action Checklist

**Goal:** Make real PPP company and product information discoverable for relevant industrial B2B searches and AI-assisted answers, and convert qualified visitors into RFQs. First-place rankings and AI citations cannot be guaranteed.

**Legend:** `[CODEX]` code / repository tasks; `[OWNER]` business information, accounts, approvals; `[BOTH]` requires collaboration. Mark complete only with verification. `P0` blocking, `P1` important, `P2` follow-up.

## Phase 0 — Inventory and baseline (P0)

- [x] [OWNER] Open the correct production repository in Codex and provide `CODEX_PROMPT.md`.
- [x] [CODEX] Identify framework, hosting, routes, rendering method, existing catalog, forms, metadata, sitemap and robots rules.
- [ ] [BOTH] Confirm production hostname (www/non-www), valid contact channels, and any planned domain changes.
- [x] [CODEX] Create `docs/seo-geo-audit.md` with current issues, file/URL evidence, and priority.
- [ ] [BOTH] Verify homepage, About, contact, and representative products load publicly (HTTP status, mobile, no login); record any 403/404/5xx or bot blocks.
- [ ] [OWNER] List existing public profiles and choose a single consistent official business name -> _CV. Prima Putra Perkasa_, address/service area, email, and phone/WhatsApp.
- [ ] [OWNER] Record baseline search queries, organic visits, RFQs and current Google/Bing index coverage if available.

## Phase 1 — Technical SEO / crawlability (P0)

- [ ] [CODEX] Set unique descriptive title, description and appropriate H1 on every important public page.
- [ ] [CODEX] Fix canonical URLs, HTTPS/host consistency, duplicates, and redirects as necessary.
- [ ] [CODEX] Create or fix production `sitemap.xml` of public, canonical, indexable URLs.
- [ ] [CODEX] Create or fix `robots.txt` with real sitemap URL; ensure intended public pages are crawlable.
- [ ] [BOTH] Check `Googlebot`, `Bingbot`, and `OAI-SearchBot` access in robots/CDN/WAF; do not change GPTBot policy without owner approval.
- [ ] [CODEX] Remove accidental `noindex`/blocked resources from intended public pages; preserve privacy on admin, CRM, ERP and private files.
- [ ] [CODEX] Ensure public content, page titles and product specs render as search-readable HTML.
- [ ] [CODEX] Add/repair semantic navigation, internal links, breadcrumbs, accessible CTA, image alt text, and mobile display.
- [ ] [CODEX] Implement verifiable JSON-LD: `Organization`, relevant `BreadcrumbList`, and `Product` on verified specific products; never invent `Offer`/price/availability/reviews.
- [ ] [CODEX] Improve high-impact image weight, page loading, mobile performance, and layout shifts.
- [ ] [CODEX] Run lint/build/tests plus route/metadata/sitemap/robots checks; log the results.
- [ ] [OWNER] Review changes before deployment; deploy via existing process and smoke-test real production URLs.

## Phase 2 — Company identity and trust (P1)

- [ ] [OWNER] Approve factual company description, categories, service areas, legal/public contact details.
- [ ] [CODEX] Improve About/Company Profile page with verified company identity and procurement value proposition.
- [ ] [CODEX] Add factual contact / RFQ page that explains what specs and quantities customers should send.
- [ ] [BOTH] Verify visible name/address/phone/contact matches any structured data and public profiles.
- [ ] [OWNER] Approve which principal/customer logos, project examples, testimonials, and certifications may legally/publicly be shown; omit the rest.
- [ ] [CODEX] Ensure claims say "supplier" or "general trading" unless authorized-distributor status is documented.

## Phase 3 — Product catalog MVP (P1)

- [ ] [OWNER] Export/list top 20–30 frequently requested or commercially important products from RFQs; remove confidential customer details.
- [ ] [OWNER] Prioritize first 5–10 real products for detailed pages and verify names/specs/brand/size/units/photos/datasheets.
- [ ] [CODEX] Create or improve category navigation for real electrical/mechanical/MRO categories.
- [ ] [CODEX] Build reusable product template + source-of-truth content schema, adapting to the existing stack.
- [ ] [CODEX] Publish first approved product pages with unique descriptions, verified specification tables, product images where licensed, and a clear RFQ CTA.
- [ ] [CODEX] Add internal links between relevant categories, specific products, and RFQ/contact.
- [ ] [CODEX] Add product JSON-LD only where it accurately reflects the visible product details.
- [ ] [BOTH] Audit product slugs, canonical URLs, sitemap inclusion, page links and mobile usability.
- [ ] [OWNER] Agree on a lightweight process to review product data when brands/specs/availability change.

## Phase 4 — Search-intent content for SEO + GEO (P1)

- [ ] [OWNER] Compile 20 real customer purchasing questions and common alternate product terms (Bahasa Indonesia and industry English).
- [ ] [BOTH] Cluster target queries by category, exact spec/part number, manufacturer model, material, use case, and genuinely serviced location.
- [ ] [CODEX] Add short factual answers and RFQ requirements on relevant pages (not generic repeated marketing text).
- [ ] [BOTH] Prepare 3–5 technically reviewed buyer guides, e.g. "Cara membaca ukuran oil seal" or "Data yang perlu dikirim saat RFQ mechanical seal".
- [ ] [CODEX] Publish approved guides with helpful internal links to real catalogue entries.
- [ ] [BOTH] Check that images/datasheets supplement, rather than replace, crawlable text.
- [ ] [BOTH] Review underperforming or near-duplicate pages before expanding catalogue at scale.

## Phase 5 — Accounts and off-site presence (P1; owner-led)

- [ ] [OWNER] Verify Google Search Console property for the canonical production domain.
- [ ] [OWNER] Submit sitemap and inspect homepage + first product/category URLs in Search Console.
- [ ] [OWNER] Verify Bing Webmaster Tools, submit sitemap and check crawl/index reports.
- [ ] [OWNER] Claim/create Google Business Profile if eligible; ensure accurate business type, area, hours, and contact.
- [ ] [OWNER] Make a complete and consistent LinkedIn Company Page.
- [ ] [OWNER] Evaluate and create truthful Indotrading/Indonetwork profiles if relevant to PPP's audience and commercial terms.
- [ ] [OWNER] Request legitimate supplier/partner citations or links only when the relationship and publication permission are real.
- [ ] [BOTH] Add verified official profiles as outbound links; use `sameAs` only for genuine PPP-owned profiles.

## Phase 6 — Conversion and measurement (P1)

- [ ] [CODEX] Confirm RFQ form, email and WhatsApp CTA all point to verified destinations and work on mobile.
- [ ] [BOTH] Configure privacy-compliant measurement of organic landing pages, form submissions and contact CTA clicks.
- [ ] [BOTH] Define primary KPI: qualified RFQs/month attributable to organic website visits; secondary KPIs: index coverage, relevant impressions/clicks, product-page engagement.
- [ ] [OWNER] Check Google Search Console search queries and landing pages monthly.
- [ ] [OWNER] Check Bing Webmaster Tools AI Performance if available; distinguish citations from ordinary mentions.
- [ ] [BOTH] Keep a dated manual test sheet for 15–20 procurement questions tested in ChatGPT, Copilot and Google AI features; record cited URLs and variability.
- [ ] [BOTH] Review progress monthly, improve pages based on actual RFQ and query data, and do not infer guaranteed AI ranking from a few test prompts.

## Optional enhancements (P2)

- [ ] [CODEX] Consider IndexNow if appropriate for the actual stack and secure deployment setup.
- [ ] [BOTH] Evaluate bilingual pages only when accurate, maintained translations are available; then implement appropriate `hreflang`.
- [ ] [BOTH] Consider an optional `llms.txt` only after core crawlability and content quality are solved; do not treat it as a ranking requirement.
- [ ] [BOTH] Expand from 5–10 to 20–30+ individually useful, verified product pages as operational capacity allows.
- [ ] [OWNER] Reassess priority products quarterly using real RFQ volume and gross-margin considerations (keep margins private).

## Definition of done for initial launch

- [ ] Public production pages load correctly and key HTML content is crawlable.
- [ ] Production sitemap, robots, metadata and canonical URLs are correct.
- [ ] Company identity and contact details are factual and consistent.
- [ ] At least 5 owner-approved, genuinely useful product pages are published.
- [ ] Working RFQ conversion paths are tested.
- [ ] Search Console and Bing Webmaster Tools verified and sitemap submitted.
- [ ] Baseline queries and RFQ metrics recorded for future comparison.
- [ ] No fictional business claims or private data published.

## Implementation checkpoint — 2026-09-24

Evidence: [audit](../docs/seo-geo-audit.md), [handoff and owner actions](../docs/seo-geo-handoff.md), [manual query worksheet](../docs/seo-geo-query-tests.md). Broad phase tasks above stay open where production checks, product approval or business verification are still missing.

- [x] [CODEX] Audit existing routes, SPA rendering, catalog source, forms and production HTTPS/route failures; record evidence.
- [x] [CODEX] Implement shared per-route titles/descriptions/canonicals/social metadata for 29 static routes; remove false language alternates and speculative LocalBusiness schema.
- [x] [CODEX] Prerender existing React public page content, guides and RFQ forms during production build; verify representative HTML with JavaScript disabled.
- [x] [CODEX] Generate sitemap from the indexable route registry (19 URLs), exclude private utilities and unapproved imported product pages; preserve GPTBot policy and explicitly allow OAI-SearchBot.
- [x] [CODEX] Add truthful minimal Organization and visible-path BreadcrumbList JSON-LD; validate JSON syntax and absence of invented Offer/review/LocalBusiness fields.
- [x] [CODEX] Add noindex metadata for private/utility, filtered catalog and unreviewed product pages; generate a noindex application shell and 404 document. Hosting enforcement remains pending.
- [x] [CODEX] Improve contact RFQ requirements and use crawlable pagination links; remove the unapproved public customer-name wall.
- [x] [CODEX] Verify generated metadata, canonical/query policy, sitemap, robots, assets, JSON-LD, mobile HTML and isolated RFQ message preparation.
- [x] [CODEX] Run production build, TypeScript, targeted lint, mocked storefront/RFQ regression and read-only live catalog regression. All passed; full-repository lint remains failing on pre-existing/vendor issues recorded in the audit, and Vite retains a bundle-size warning.
- [x] [CODEX] Document privacy-aware analytics requirements and create a 20-query candidate worksheet without inventing test outcomes.
- [ ] [BOTH] Resolve production certificate, canonical host and deep-route 404s; approve deployment routing and verify live pages after deployment.
- [x] [CODEX] Prepare repository `netlify.toml`: production build/publish settings, static-first product rewrite and real 404 fallback. `npm.cmd run build` and `npm.cmd run test:seo` pass; actual Netlify deployment/routing remains unverified and is not checked off.
- [ ] [OWNER] Confirm PT/CV identity, contacts, founding year, address/hours, PDF rights and existing business claims before publication.
- [ ] [BOTH] Implement and populate the reviewed-product overlay, Product JSON-LD and product HTML only after owner approves the first 5–10 records and image/datasheet rights. Operational imported product records remain unindexed.
- [ ] [OWNER] Verify search/analytics accounts, submit the repaired sitemap and record real baseline metrics and query results.

No production infrastructure or deployment was changed for this checkpoint. Initial-launch definition of done is **not complete**.
