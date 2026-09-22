import { chromium } from '../node_modules/.ppp-qa/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

import { loadEnv } from 'vite';
const env = loadEnv('production', process.cwd(), 'VITE_');
const origin = new URL(env.VITE_SUPABASE_URL).origin;
const products = JSON.parse(await fs.readFile('Scraper/storefront_sample_products.json', 'utf8'));
assert.equal(products.length, 100);
assert.equal(new Set(products.map(p => p.id)).size, 100);
for (const p of products) {
  assert(p.price_idr > 0);
  assert.equal(p.availability, 'on_request');
}
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultNavigationTimeout(60000);
  await page.route('https://**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const localImages = [];
  page.on('request', request => { if (request.url().includes('/catalog/indoteknik/')) localImages.push(request.url()); });
  const catalogResponse = page.waitForResponse(response => response.url().startsWith(`${origin}/rest/v1/products?`) && response.status() === 200);
  await page.goto('http://127.0.0.1:8080/products', { waitUntil: 'domcontentloaded' });
  await page.getByText('100 produk', { exact: true }).waitFor();
  const remoteProducts = await (await catalogResponse).json();
  assert.equal(remoteProducts.length, 100);
  for (const p of remoteProducts) assert(p.image_url.startsWith(`${origin}/storage/v1/object/public/indoteknik-products/`));
  assert.equal(await page.locator('.demo-notice').count(), 0);
  assert.equal(await page.locator('.product-card').count(), 12);
  await page.locator('.product-card img').first().scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('.product-card img')].some(img => img.complete && img.naturalWidth > 0));
  await page.getByRole('button', { name: 'Berikutnya', exact: true }).click();
  await page.getByText('2 / 9', { exact: true }).waitFor();
  await page.goto(`http://127.0.0.1:8080/products?q=${encodeURIComponent(products[0].name_id)}`);
  await page.getByRole('link', { name: products[0].name_id, exact: true }).waitFor();
  await page.getByRole('link', { name: products[0].name_id, exact: true }).click();
  await page.getByRole('heading', { name: products[0].name_id, exact: true }).waitFor();
  await page.waitForFunction(() => document.querySelector('.product-image img')?.naturalWidth > 0);
  assert((await page.locator('.product-detail .product-image img').getAttribute('src')).startsWith(origin));
  await page.getByRole('button', { name: 'Tambah ke keranjang', exact: true }).click();
  await page.goto('http://127.0.0.1:8080/cart');
  await page.getByText(products[0].name_id, { exact: true }).waitFor();
  await page.goto('http://127.0.0.1:8080/products', { waitUntil: 'domcontentloaded' });
  await page.getByText('100 produk', { exact: true }).waitFor();
  await fs.mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/indoteknik-catalog.png', fullPage: true });
  assert.equal(localImages.length, 0);
  console.log('PASS: 100 Supabase products, remote images, no local catalog requests, pagination, search, detail and cart.');
} finally {
  await browser.close();
}
