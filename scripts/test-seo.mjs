import assert from 'node:assert/strict';
import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { seoPages, metadata, siteOrigin, seoHead } = await import(pathToFileURL(resolve('artifacts/seo-ssr/entry-server.js')).href);
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const robots = await readFile('dist/robots.txt', 'utf8');
const titles = new Set();
const descriptions = new Set();
const results = [];
for (const [route, config] of Object.entries(seoPages)) {
  const file = route === '/' ? 'dist/index.html' : `dist${route}/index.html`;
  const html = await readFile(file, 'utf8');
  const head = html.split('</head>')[0];
  const expected = metadata(route);
  assert.equal((head.match(/<title\b/g) || []).length, 1, route);
  assert.equal((head.match(/rel="canonical"/g) || []).length, 1, route);
  assert.ok(head.includes(`href="${siteOrigin}${route}"`), route);
  assert.ok(head.includes(`content="${expected.robots}"`), route);
  assert.ok(!titles.has(expected.title), `Duplicate title: ${route}`);
  assert.ok(!descriptions.has(expected.description), `Duplicate description: ${route}`);
  titles.add(expected.title); descriptions.add(expected.description);
  assert.equal(sitemap.includes(`<loc>${siteOrigin}${route}</loc>`), config.index, route);
  assert.ok(!head.includes('hreflang') && !head.includes('lovable.dev'), route);
  if (config.index) {
    assert.equal((html.match(/<h1\b/g) || []).length, 1, route);
    assert.ok(html.includes('href="/contact"') && html.includes('href="/products"'), route);
    assert.ok(html.length > 10000, `Empty HTML: ${route}`);
  }
  for (const match of head.matchAll(/<script data-seo type="application\/ld\+json">(.*?)<\/script>/g)) {
    const schema = JSON.parse(match[1]);
    assert.ok(['Organization', 'BreadcrumbList'].includes(schema['@type']));
    assert.ok(!/"(offers|aggregateRating|review|geo|foundingDate|sameAs)"/.test(match[1]));
  }
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)) await access(`dist${match[1]}`);
  results.push({ route, indexable: config.index, h1: (html.match(/<h1\b/g) || []).length });
}
for (const route of ['/products?q=bosch', '/products?page=2', '/products?ready=true', '/products/unreviewed-id', '/account', '/admin', '/cart', '/auth', '/tracking', '/missing']) assert.equal(metadata(route).robots, 'noindex,follow', route);
assert.equal(metadata('/about?utm_source=test').canonical, `${siteOrigin}/about`);
assert.equal(metadata('/products/?q=bolt&utm_source=test').canonical, `${siteOrigin}/products?q=bolt`);
assert.equal(metadata('/missing').canonical, undefined);
assert.ok(!seoHead('/products?q=%22%3E%3Cscript%3E').includes('"><script>'));
for (const bot of ['Googlebot', 'Bingbot', 'OAI-SearchBot', '*']) assert.ok(robots.includes(`User-agent: ${bot}\nAllow: /`));
assert.ok(!robots.includes('GPTBot')); // Existing wildcard Allow remains unchanged.
assert.ok(robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`));
assert.ok(!sitemap.includes('<lastmod>') && !sitemap.includes('/products/'));
assert.equal(await readFile('public/sitemap.xml', 'utf8'), sitemap);
assert.equal(await readFile('public/robots.txt', 'utf8'), robots);
await access('dist/images/industrial-overview.jpg');
for (const file of ['dist/404.html', 'dist/app-shell.html']) {
  const html = await readFile(file, 'utf8');
  assert.ok(html.includes('content="noindex,follow"'));
  assert.ok(!html.includes('rel="canonical"'));
}
await writeFile('artifacts/seo-verification.json', JSON.stringify({ testedAt: new Date().toISOString(), routes: results, sitemapUrls: [...sitemap.matchAll(/<loc>/g)].length, status: 'passed' }, null, 2));
console.log(`PASS: ${results.length} prerendered routes; metadata, H1, assets, sitemap, robots, JSON-LD, query policy, private exclusions and safe HTML escaping.`);
