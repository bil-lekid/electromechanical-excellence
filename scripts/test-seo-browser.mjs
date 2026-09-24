import { chromium } from '../node_modules/.ppp-qa/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

// Local static-first routing fixture only. This does not configure production hosting.
const root = resolve('dist');
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  let file = resolve(root, `.${decodeURIComponent(path)}`);
  if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  let status = 200;
  try { if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html'); await stat(file); }
  catch { file = resolve(root, /^\/products\/[^/]+$/.test(path) ? 'app-shell.html' : '404.html'); if (!path.startsWith('/products/')) status = 404; }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain' };
  try { res.writeHead(status, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }); res.end(await readFile(file)); }
  catch { res.writeHead(500).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await staticContext.route('https://**', route => route.abort());
  const page = await staticContext.newPage();
  for (const route of ['/', '/about', '/contact', '/products', '/help/quotation', '/forms/quotation']) {
    assert.equal((await page.goto(base + route)).status(), 200);
    assert.equal(await page.locator('h1').count(), 1);
    assert.ok((await page.locator('h1').innerText()).trim().length > 5);
    assert.equal(await page.locator('link[rel=canonical]').count(), 1);
    assert.ok(await page.locator('a[href="/contact"]').count());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Mobile overflow ${route}`);
  }
  assert.equal((await page.goto(base + '/does-not-exist')).status(), 404);
  assert.equal(await page.locator('meta[name=robots]').getAttribute('content'), 'noindex,follow');
  await staticContext.close();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route('https://**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  const live = await context.newPage();
  const errors = []; live.on('pageerror', e => errors.push(e.message));
  await live.goto(base + '/contact');
  await live.locator('h1').filter({ hasText: 'Kontak dan permintaan penawaran' }).waitFor();
  await live.locator('a[href="/forms/quotation"]').last().click();
  await live.waitForURL('**/forms/quotation');
  await live.waitForFunction(() => document.title.startsWith('Request for Quotation'));
  assert.equal(await live.locator('link[rel=canonical]').getAttribute('href'), 'https://primaputraperkasa.com/forms/quotation');
  await live.locator('[name=name]').fill('Browser Test');
  await live.locator('[name=company]').fill('Test Company');
  await live.locator('[name=phone]').fill('0800000000');
  await live.locator('[name=details]').fill('Part number dan jumlah untuk pengujian lokal.');
  await live.getByRole('button', { name: 'Siapkan pesan' }).click();
  await live.getByText('Permintaan belum terkirim.', { exact: false }).waitFor();
  const href = await live.getByRole('link', { name: 'Lanjutkan ke WhatsApp' }).getAttribute('href');
  assert.ok(href.startsWith('https://wa.me/6287885572522?text='));
  assert.ok(!await live.locator('head').innerHTML().then(html => html.includes('Browser Test')));
  await live.goto(base + '/products?q=test&page=2');
  await live.waitForFunction(() => document.querySelector('meta[name=robots]')?.content === 'noindex,follow');
  await live.goto(base + '/auth');
  await live.waitForFunction(() => document.title.startsWith('Masuk / Daftar'));
  assert.equal(await live.locator('meta[name=robots]').getAttribute('content'), 'noindex,follow');
  assert.deepEqual(errors, []);
  await writeFile('artifacts/seo-browser-verification.json', JSON.stringify({ testedAt: new Date().toISOString(), status: 'passed', checks: ['six routes without JavaScript', 'mobile overflow', '404 status', 'client navigation metadata', 'RFQ validation and WhatsApp preparation only', 'no form data in metadata', 'query and auth noindex', 'no browser errors'] }, null, 2));
  console.log('PASS: production-build HTML without JavaScript, mobile, navigation metadata, noindex and isolated RFQ preparation. No messages sent.');
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
