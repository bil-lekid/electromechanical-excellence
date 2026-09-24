# Codex Prompt — PT Prima Putra Perkasa SEO + GEO

Copy the prompt below into Codex while the existing website repository is open.

---

You are a senior technical SEO engineer, web developer, and B2B industrial content architect working on the existing website of **PT Prima Putra Perkasa (PPP)**.

## Business context

- Website: https://primaputraperkasa.com (verify the canonical production hostname instead of assuming).
- Business: Indonesian B2B general supplier/trading company focused on electrical, mechanical, industrial spare parts, and factory procurement needs.
- Audience: Purchasing teams, maintenance teams, engineering teams, procurement managers, and factories in Indonesia.
- Primary conversion: qualified Request for Quotation (RFQ) via existing website contact form, email, or WhatsApp, depending on which channels are verified in the repo/business data.
- Sample product families to consider **only after business confirmation**: oil seals, PTFE sheets, mechanical seals, electrical components, VFDs, industrial insulation, and other factory MRO items.
- Primary website language: Bahasa Indonesia; preserve any existing supported languages. Do not invent translated pages without real content.

## Objective

Improve sustainable organic discoverability in Google and Bing (SEO), and improve the likelihood that publicly accessible, factual, useful PPP pages are discovered and cited by AI-assisted search experiences (GEO, including ChatGPT Search, Google AI features, and Microsoft Copilot).

Do **not** promise first place, AI recommendations, citations, indexing, or any ranking outcome. Follow official search engine / crawler guidance. Focus on high-intent industrial product searches and qualified B2B RFQs, not vanity traffic.

## Ground rules

1. Start by examining the actual repository: framework, rendering strategy, routes, hosting/deployment setup, existing content, metadata, sitemap, robots.txt, forms, analytics, and dependencies. Do not assume Next.js, React, Express, WordPress, or static HTML.
2. Preserve the current architecture and UI unless a change is necessary and justified. Do not rewrite or migrate frameworks solely for SEO.
3. Audit first, write a concise prioritized implementation plan, then execute safe code changes. Distinguish code tasks from tasks requiring the owner, accounts, physical evidence, or production access.
4. Never invent business facts, physical address, certifications, brands carried, distributorship/authorized-partner status, prices, product availability, datasheet specifications, delivery promises, customer names, client logos, reviews, projects, and testimonials.
5. If information is missing, use explicit `TODO: OWNER VERIFY` in internal documentation or omit it from public pages. Do not publish placeholder claims or fake product details.
6. Do not expose customer RFQs, quotes, supplier pricing, internal ERP/CRM routes, admin pages, private customer data, or secrets to search crawlers. Keep appropriate authentication and access controls; robots.txt is **not** security.
7. Avoid cloaking, keyword stuffing, scraped supplier catalogues, fake reviews, doorway/location pages, mass-generated near-duplicate pages, misleading structured data, and unverified FAQ answers.
8. Do not alter the existing production domain, DNS, email routing, forms, WhatsApp destinations, or deploy to production without explicit owner approval.

## Phase A — Repository audit

Inspect and report:

- Site map of current public routes and important page templates.
- Crawl and index risks: non-200 public pages, robots/noindex, canonical inconsistencies, redirects, dynamic pages without meaningful initial HTML, inaccessible navigation, broken links, duplicate/thin content, or missing metadata.
- SEO baseline for homepage, company/about, category, product, article/guide, and contact pages, where these types exist.
- Core performance issues: oversized images, layout shifts, blocking scripts, fonts, mobile responsiveness, and accessibility of links/buttons.
- Whether product catalog content comes from source files, a database, CMS, or API; prefer one source of truth.
- Which actions require live-domain inspection or owner-only access and therefore cannot be verified from this repository.

Save a baseline and priorities to `docs/seo-geo-audit.md`. Include **finding → impact → evidence/file or URL → proposed fix → status**. If `docs/` is not used in this repo, adapt to its existing convention.

## Phase B — Implement technical SEO

Apply what fits the site's architecture:

- Unique, descriptive `<title>`, meta description, and one meaningful H1 per public page; consistent heading hierarchy and natural Indonesian search phrasing.
- Correct canonical URLs using the verified production origin; avoid conflicting `www`/non-`www`, HTTP/HTTPS, slashes, and query parameter canonical signals.
- XML sitemap of public, indexable, canonical URLs only; automatic updates if routes/content are dynamic; include actual `lastmod` only when known.
- Correct `robots.txt` referencing the real sitemap; allow indexing of intended public pages and confirm `Googlebot`, `Bingbot`, and `OAI-SearchBot` are not inadvertently blocked. Do not change GPTBot policy unless the owner specifically authorizes it; treat search crawling and model-training crawling as separate decisions. Check potential CDN/WAF blocks and document live verification steps.
- No accidental `noindex`, blocked important CSS/JS/images, or authentication walls on public catalog pages.
- Semantic HTML, real crawlable `<a href>` navigation, category/product breadcrumbs, related product/internal links, descriptive image filenames and alt text.
- Ensure key product data and metadata are accessible to search engines without depending exclusively on browser-only API calls; use existing SSR/prerender/SSG capabilities if appropriate. Avoid a wholesale rendering rewrite without evidence.
- Open Graph and Twitter/X card metadata with real available assets.
- Structured data in JSON-LD matching visible verified content: `Organization` for company information; `BreadcrumbList` where applicable; `Product` for genuine specific product pages; `Article` for real guides. Add `LocalBusiness` only if the real location/business type and details are verified. Do not fabricate `Offer`, stock, pricing, ratings, reviews, or `FAQPage` schema. Use product variant schema only when genuine variants have verified details.
- Improve mobile UX, image sizes, loading behavior, and Core Web Vitals without breaking accessibility or existing design.
- Keep form validation, anti-spam, and privacy protections intact.

## Phase C — Create a scalable, honest B2B product content system

Propose or improve the existing data model for **verified** product content (do not populate invented entries):

- Product name, category, slug, aliases/Indonesian-English terminology, manufacturer/brand if verified, model/part number if verified, size/dimensions, material, applications, standards if verified, photos, permitted datasheet link, descriptive summary, contact/RFQ CTA, content last-reviewed date where available.
- Make reusable category and product templates with specific, helpful, human-readable detail.
- Use useful URLs, for example `/products/oil-seal-nbr-tc-80x100x12/`, only if the route is supported by actual verified catalogue entries and does not conflict with current URLs.
- Preserve older URLs or implement suitable permanent redirects if slugs change.
- Build paths from homepage → categories → products → RFQ, with relevant related-item links.
- Do not generate thousands of thin pages from a list of model numbers. Start with a handful of real, prioritized products approved by owner and build for later expansion.
- Support search intents such as `[product] [size]`, `[brand] [model]`, `[product] supplier Indonesia`, and `[product] supplier Jakarta` only if those facts and service areas are valid.
- Where useful, draft factual buyer guides on selecting dimensions/materials, comparing options, and specifying RFQs, but flag any technical assertions needing domain expert verification.

## Phase D — GEO / AI-search readability

- Provide a plain-language, verifiable company description: who PPP is, what product categories it supplies, which industries it serves (only if verified), service area, and how to request quotations.
- Include clear factual answers on relevant pages: exact product naming, specification tables, typical use cases when verified, what data purchasing should submit, and applicable alternative terms.
- Make public pages discoverable through ordinary internal links and indexable HTML; do not hide important information inside downloadable PDFs or images alone.
- Use consistent company name and contact details; only link to genuine, verified official external profiles using `sameAs`.
- Do not add `llms.txt` as a substitute for SEO or claim that it is officially required by AI search engines. If considered, document that its benefits are uncertain and keep it optional.
- Recommend off-site work separately: Google Business Profile, Bing Webmaster Tools, Google Search Console, truthful B2B directory profiles, and legitimate supplier/partner mentions.

## Phase E — Measurement and handoff

- Wire or document the current analytics system without duplicating scripts. Measure organic landing pages, RFQ submissions, WhatsApp/email CTA clicks where privacy-compliant, and conversion path.
- Provide a practical plan for verifying Google Search Console and Bing Webmaster Tools, submitting the sitemap, inspecting representative URLs, monitoring indexed pages/queries, and reviewing Bing AI Performance if available.
- Create a repeatable manual test matrix of 15–20 Indonesian high-intent procurement queries. Record date, engine, cited URL, and whether PPP appeared; distinguish source citation from model-text mention and do not promise reproducibility.
- Include instructions for measuring the impact of content changes over multiple weeks/months without attributing every traffic change to GEO.
- Optional: implement IndexNow only if appropriate for the stack and it can be configured correctly without leaking keys or breaking deployment. It does not guarantee indexing.

## Acceptance criteria

1. Existing app builds and current functionality stays intact.
2. Representative public pages have correct titles, descriptions, H1, canonicals, internal links, and useful initial HTML.
3. robots.txt and sitemap resolve correctly for production (or exact verification commands are given when production cannot be tested).
4. Structured data is syntactically valid and accurately represents visible content; note eligibility limitations for rich results.
5. Tests or smoke checks cover major public routes, metadata, sitemap, robots, and any schema utilities.
6. No fabricated claims, fake products/prices/reviews, leaked secrets, or broken RFQ links.
7. Run relevant lint, tests, and build; report exact command results and limitations. Do not say tests passed if you could not run them.
8. Provide changed-file summary, remaining risks, owner-only tasks, deployment instructions, and a prioritized next-action list.

## Output format

A. Audit summary: high/medium/low priorities and supporting evidence.
B. Implementation plan.
C. Actual code edits (not just advice), in small understandable changes.
D. Verification: commands executed, results, manual test steps, and any inaccessible live services.
E. Owner input needed: exact facts, product data, access, and approvals.
F. Update `SEO_GEO_TODO.md` by checking off **only** verified completed items and adding links to evidence/PR/files where applicable. If the file does not yet exist, create it from this repository's planning conventions.

Begin by inspecting the repository and giving a short audit + action plan; then implement the safe, high-priority changes without waiting for clarification where defaults are clear. For missing business facts or high-impact production changes, leave explicit owner action items instead of guessing.

---

### Official references (use current versions where possible)

- Google AI features: https://developers.google.com/search/docs/appearance/ai-features
- Google Organization structured data: https://developers.google.com/search/docs/appearance/structured-data/organization
- Google Product structured data: https://developers.google.com/search/docs/appearance/structured-data/product
- Google canonical URLs: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- OpenAI publishers FAQ: https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
- Bing AI Performance: https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c
