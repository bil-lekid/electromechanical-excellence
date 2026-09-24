// Live read-only catalog tests; cart changes stay in this isolated browser's local storage.
import { chromium } from '../node_modules/.ppp-qa/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const base = process.env.CATALOG_TEST_BASE || 'http://127.0.0.1:8083';
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route('https://fonts.googleapis.com/**', route => route.abort());
  const page = await context.newPage(); page.setDefaultTimeout(20000);
  const errors = [], requests = [], responses = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.url().includes('/rest/v1/')) requests.push(new URL(request.url())); });
  page.on('response', async response => {
    if (new URL(response.url()).pathname === '/rest/v1/products' && response.ok()) {
      try { const rows = await response.json(); responses.push(Array.isArray(rows) ? rows : rows ? [rows] : []); } catch { /* cancelled response */ }
    }
  });
  const settled = () => page.locator('.catalog-results[aria-busy="false"]').waitFor();
  const cardIds = () => page.locator('.catalog-results .product-name').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')));
  const started = performance.now();
  await page.goto(base + '/products', { waitUntil: 'domcontentloaded' }); await settled();
  const coldCatalogMs = Math.round(performance.now() - started);
  assert.equal(await page.locator('.catalog-results .product-card').count(), 12);
  const total = Number((await page.locator('.catalog-toolbar [role="status"]').innerText()).split(' ')[0]);
  assert.ok(total > 44000);
  const first = await cardIds();
  const nextStart = performance.now();
  await page.getByRole('link', { name: 'Berikutnya', exact: true }).click(); await settled();
  const nextPageMs = Math.round(performance.now() - nextStart);
  const second = await cardIds(); assert.equal(second.length, 12); assert.equal(first.filter(id => second.includes(id)).length, 0);
  await page.getByRole('link', { name: 'Sebelumnya', exact: true }).click(); await settled(); assert.deepEqual(await cardIds(), first);
  console.log('PASS server pagination, stable ordering and cached back navigation');
  await page.getByRole('searchbox').fill('bosch drill');
  const searchStart = performance.now(); await page.getByRole('button', { name: 'Cari', exact: true }).click(); await settled();
  const searchMs = Math.round(performance.now() - searchStart);
  assert.equal(await page.locator('.catalog-toolbar [role="status"]').innerText(), '257 produk');
  await page.getByLabel('Urutkan', { exact: true }).selectOption('price-asc'); await settled();
  const prices = await page.locator('.catalog-results .product-price').allTextContents();
  const numeric = prices.map(p => Number(p.split('/')[0].replace(/\D/g, '')));
  assert.deepEqual(numeric, [...numeric].sort((a,b) => a-b));
  await page.getByLabel('Hanya produk tersedia').check(); await settled();
  assert.equal(await page.getByRole('heading', { name: 'Produk belum ditemukan', exact: true }).count(), 1);
  await page.getByLabel('Hanya produk tersedia').uncheck(); await settled();
  const selected = await page.locator('.catalog-results .product-name').first().innerText();
  await page.locator('.catalog-results .product-name').first().click();
  await page.getByRole('heading', { name: selected, exact: true }).waitFor();
  await page.getByLabel('Jumlah produk', { exact: true }).fill('3');
  await page.getByRole('button', { name: 'Tambah ke keranjang', exact: true }).click();
  await page.goto(base + '/cart'); await page.getByLabel('Jumlah produk', { exact: true }).waitFor();
  await page.getByRole('link', { name: selected, exact: true }).waitFor();
  await page.reload(); await page.getByRole('link', { name: selected, exact: true }).waitFor();
  assert.equal(await page.getByLabel('Jumlah produk', { exact: true }).inputValue(), '3');
  assert.ok(requests.some(url => url.searchParams.get('id')?.startsWith('in.(')));
  console.log('PASS multiword indexed search, price sort, availability filter, detail and persistent cart');
  await page.goto(base + '/products?q=zzzz-no-product-9f412'); await settled();
  await page.getByRole('heading', { name: 'Produk belum ditemukan', exact: true }).waitFor();
  for (const term of ['%', '_', '*']) {
    await page.getByRole('searchbox').fill(term); await page.getByRole('button', { name: 'Cari', exact: true }).click(); await settled();
    const count = Number((await page.locator('.catalog-toolbar [role="status"]').innerText()).split(' ')[0]);
    assert.ok(count < total, `Literal ${term} must not act as a wildcard`);
    assert.equal(await page.getByRole('heading', { name: 'Katalog belum dapat dimuat', exact: true }).count(), 0);
  }
  console.log('PASS literal wildcard characters do not broaden search');
  await page.goto(base + '/products?page=999999'); await settled();
  await page.waitForURL(`**/products?page=${Math.ceil(total/12)}`); await settled();
  assert.equal(await page.locator('.catalog-results .product-card').count(), total % 12 || 12);
  await page.goto(base + '/products/not-a-uuid'); await page.getByRole('heading', { name: 'Produk tidak ditemukan', exact: true }).waitFor();
  console.log('PASS empty results, out-of-range page and invalid product URL');
  await page.goto(base + '/brands'); await page.locator('.brand-grid a').first().waitFor();
  assert.ok(await page.locator('.brand-grid a').count() > 900);
  const info = await context.newPage(); const infoRequests = [];
  info.on('request', request => { if (request.url().includes('/rest/v1/')) infoRequests.push(request.url()); });
  await info.goto(base + '/about'); await info.getByText('CV. Prima Putra Perkasa adalah perusahaan General Supplier', { exact: false }).waitFor();
  assert.equal(infoRequests.length, 0); await info.close();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/products?q=bosch+drill'); await settled();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await page.screenshot({ path: 'artifacts/catalog-performance-mobile.png', fullPage: true });
  assert.ok(responses.every(rows => rows.length <= 12), 'No product response may contain the full catalog');
  assert.deepEqual(errors, []);
  const summary = { total, coldCatalogMs, searchMs, nextPageMs, largestProductResponse: Math.max(...responses.map(r => r.length)), productRequests: requests.filter(u => u.pathname === '/rest/v1/products').length, errors };
  await fs.writeFile('artifacts/catalog-performance-checks.json', JSON.stringify(summary, null, 2));
  console.log('PASS facets, zero catalog requests on company pages, mobile layout, bounded responses');
  console.log(JSON.stringify(summary));
} finally { await browser.close(); }
