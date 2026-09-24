import { chromium } from '../node_modules/.ppp-qa/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const label = process.argv[2] || 'after';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(180000);
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  const requests = []; const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.url().includes('/rest/v1/')) requests.push(request.url()); });
  const start = performance.now();
  await page.goto('http://127.0.0.1:8083/', { waitUntil: 'domcontentloaded' });
  await page.locator('.home-products .product-card').first().waitFor();
  const home = { ms: Math.round(performance.now()-start), requests: requests.length };
  await page.getByRole('searchbox').fill('bosch drill');
  const searchStart = performance.now(); const before = requests.length;
  await page.getByRole('button', { name: 'Cari', exact: true }).click();
  await page.locator('.catalog-results .product-card').first().waitFor();
  const search = { ms: Math.round(performance.now()-searchStart), requests: requests.length-before, text: await page.locator('.catalog-toolbar').innerText() };
  await page.waitForFunction(() => [...document.querySelectorAll('.catalog-results .product-image img')].slice(0,3).every(img => img.complete && img.naturalWidth > 0));
  await page.screenshot({ path: `artifacts/catalog-performance-${label}.png`, fullPage: false });
  const result = { home, search, errors, requests };
  await fs.writeFile(`artifacts/catalog-performance-${label}.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ home, search, errors }));
} finally { await browser.close(); }
