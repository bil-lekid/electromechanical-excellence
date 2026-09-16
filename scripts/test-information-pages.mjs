// Local UI verification. No customer messages or requests are sent.
import { chromium } from '../node_modules/.ppp-qa/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:8081';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route('https://**', route => route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin);
  await page.locator('.footer-directory').waitFor();
  const links = await page.locator('.footer-directory a[href^="/"]').evaluateAll(nodes => [...new Set(nodes.map(node => node.getAttribute('href')))]);
  const publicLinks = links.filter(path => path !== '/account');
  for (const path of publicLinks) {
    await page.goto(origin + path);
    await page.locator('main h1').waitFor();
    assert(!/404|not found/i.test(await page.locator('main h1').innerText()), path);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Desktop overflow: ${path}`);
  }
  await page.goto(origin + '/forms/sales-visit');
  await page.getByRole('button', { name: 'Siapkan pesan', exact: true }).click();
  assert.equal(await page.locator('.message-preview').count(), 0, 'Empty form must not produce a message');
  await page.getByLabel('Nama lengkap').fill('Test Buyer');
  await page.getByLabel('Nama perusahaan').fill('Test Company');
  await page.getByLabel('Nomor telepon / WhatsApp').fill('081234567890');
  await page.getByLabel('Agenda & lokasi kunjungan').fill('Diskusi kebutuhan panel di Jakarta, Senin pagi.');
  await page.getByRole('button', { name: 'Siapkan pesan', exact: true }).click();
  await page.getByRole('heading', { name: 'Pesan siap ditinjau' }).waitFor();
  const messageLink = await page.getByRole('link', { name: 'Lanjutkan ke WhatsApp' }).getAttribute('href');
  assert.equal(new URL(messageLink).hostname, 'wa.me');
  assert(new URL(messageLink).searchParams.get('text').includes('Test Buyer'));
  assert(new URL(messageLink).searchParams.get('text').includes('Kunjungan Sales'));
  await fs.mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/ppp-form-desktop.png', fullPage: true });
  await page.getByLabel('Nama lengkap').fill('Updated Buyer');
  assert.equal(await page.locator('.message-preview').count(), 0, 'Editing must invalidate prepared message');
  await page.goto(origin + '/help');
  await page.getByRole('textbox', { name: 'Cari panduan' }).fill('garansi');
  assert.equal(await page.locator('.help-grid > a').count(), 1);
  await page.getByRole('textbox', { name: 'Cari panduan' }).fill('xyz-no-results');
  await page.getByRole('heading', { name: 'Panduan tidak ditemukan' }).waitFor();
  await page.getByRole('button', { name: 'Tampilkan semua panduan' }).click();
  assert.equal(await page.locator('.help-grid > a').count(), 7);
  await page.goto(origin + '/tracking');
  await page.getByLabel('Nomor referensi pesanan').fill('PO/TEST 123');
  await page.getByRole('button', { name: 'Siapkan pertanyaan' }).click();
  const trackingLink = await page.getByRole('link', { name: 'Tanyakan melalui WhatsApp' }).getAttribute('href');
  assert(new URL(trackingLink).searchParams.get('text').includes('PO/TEST 123'));
  await page.goto(origin + '/company-profile');
  const pdfUrl = await page.getByRole('link', { name: 'Unduh PDF' }).getAttribute('href');
  const pdf = await context.request.get(origin + pdfUrl);
  assert.equal((await pdf.body()).subarray(0, 5).toString(), '%PDF-');
  await page.screenshot({ path: 'artifacts/ppp-profile-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of publicLinks) {
    await page.goto(origin + path);
    await page.locator('main h1').waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Mobile overflow: ${path}`);
  }
  await page.getByRole('button', { name: 'Menu navigasi' }).click();
  await page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link', { name: 'Pusat bantuan' }).click();
  await page.getByRole('heading', { name: 'Apa yang bisa kami bantu?' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Menu navigasi' }).getAttribute('aria-expanded'), 'false');
  await page.screenshot({ path: 'artifacts/ppp-help-mobile.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log(`PASS: ${publicLinks.length} public footer routes at desktop/mobile; form validation and preview; help search; tracking message; PDF download; mobile navigation; no runtime errors.`);
} finally {
  await browser.close();
}
