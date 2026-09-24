// Read-only HTTP evidence. No DNS, hosting, crawler policy or production writes.
import fs from 'node:fs/promises';
const targets = [
  'http://primaputraperkasa.com/', 'https://primaputraperkasa.com/',
  'http://www.primaputraperkasa.com/', 'https://www.primaputraperkasa.com/',
  'https://primaputraperkasa.com/about', 'https://primaputraperkasa.com/contact',
  'https://primaputraperkasa.com/products', 'https://primaputraperkasa.com/robots.txt',
  'https://primaputraperkasa.com/sitemap.xml',
  'https://www.primaputraperkasa.com/about', 'https://www.primaputraperkasa.com/contact',
  'https://www.primaputraperkasa.com/products', 'https://www.primaputraperkasa.com/robots.txt',
  'https://www.primaputraperkasa.com/sitemap.xml',
];
try {
  const receipt = JSON.parse(await fs.readFile('artifacts/supabase-import-receipt.json', 'utf8'));
  if (receipt.products?.[0]?.id) targets.push(`https://www.primaputraperkasa.com/products/${receipt.products[0].id}`);
} catch { /* A local import receipt is optional. */ }
const results = [];
for (let i = 0; i < targets.length; i += 3) {
  await Promise.all(targets.slice(i, i + 3).map(async url => {
    const chain = []; let current = url;
    try {
      for (let hop = 0; hop < 5; hop++) {
        const response = await fetch(current, { redirect: 'manual', signal: AbortSignal.timeout(12000) });
        const location = response.headers.get('location');
        chain.push({ url: current, status: response.status, location, contentType: response.headers.get('content-type') });
        if (response.status >= 300 && response.status < 400 && location) { await response.body?.cancel(); current = new URL(location, current).href; continue; }
        const body = await response.text();
        results.push({ url, chain, canonical: body.match(/<link[^>]*rel=["']canonical["'][^>]*>/i)?.[0] ?? null,
          title: body.match(/<title[^>]*>(.*?)<\/title>/is)?.[1] ?? null,
          h1Count: (body.match(/<h1[\s>]/gi) ?? []).length,
          ...(url.endsWith('.txt') || url.endsWith('.xml') ? { body: body.slice(0, 10000) } : {}) });
        return;
      }
      results.push({ url, chain, error: 'Too many redirects' });
    } catch (error) { results.push({ url, chain, error: error.cause?.code || error.message }); }
  }));
}
await fs.mkdir('artifacts', { recursive: true });
for (const agent of ['Googlebot', 'Bingbot', 'OAI-SearchBot']) {
  try {
    const response = await fetch('https://www.primaputraperkasa.com/robots.txt', { headers: { 'User-Agent': agent }, signal: AbortSignal.timeout(12000) });
    results.push({ agent, url: response.url, status: response.status, body: (await response.text()).slice(0, 10000) });
  } catch (error) { results.push({ agent, error: error.cause?.code || error.message }); }
}
await fs.writeFile('artifacts/seo-live-audit.json', JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2));
console.log(JSON.stringify(results));
