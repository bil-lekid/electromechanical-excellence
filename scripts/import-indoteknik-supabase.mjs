// Server-side import only. Never expose the service key through VITE_* variables.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const bucket = 'indoteknik-products';
const upload = process.argv.includes('--upload');
const applyMigration = process.argv.includes('--apply-migration');
const env = loadEnv('production', root, 'VITE_');
const privateEnv = loadEnv('production', root, 'SUPABASE_');
let secrets = {};
try { secrets = parseEnv(await fs.readFile(path.join(root, '.env.supabase.local'), 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const secret = secrets.SUPABASE_SERVICE_ROLE_KEY || privateEnv.SUPABASE_SERVICE_ROLE_KEY;
const managementToken = secrets.SUPABASE_ACCESS_TOKEN || privateEnv.SUPABASE_ACCESS_TOKEN;
const url = env.VITE_SUPABASE_URL;
const publicKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const archivedPath = path.join(root, 'Scraper/storefront_sample_products.json');

function fail(message) { throw new Error(message); }
function check(result, action) { if (result.error) fail(`${action}: ${result.error.message}`); return result.data; }
function stableId(sku) {
  const bytes = createHash('sha1').update(`ppp:indoteknik:${sku}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

async function main() {
  if (!url || !publicKey) fail('Missing public Supabase configuration in .env.');
  await fs.mkdir(path.join(root, 'artifacts'), { recursive: true });
  await build({ entryPoints: [path.join(root, 'src/lib/store.ts')], bundle: true, platform: 'node', format: 'esm', outfile: path.join(root, 'artifacts/import-product-schema.mjs') });
  const { productSchema } = await import('../artifacts/import-product-schema.mjs');
  const sample = JSON.parse(await fs.readFile(archivedPath, 'utf8'));
  const products = productSchema.array().parse(sample);
  if (products.length !== 100 || new Set(products.map(p => p.sku)).size !== 100) fail('Expected exactly 100 distinct product SKUs.');
  const sources = JSON.parse(await fs.readFile(path.join(root, 'Scraper/storefront_sample_sources.json'), 'utf8'));
  const images = [];
  for (const product of products) {
    if (!/^IND-[\w-]+$/.test(product.sku || '') || product.price_idr === null || product.price_idr <= 0 || product.availability !== 'on_request') fail('Invalid source product.');
    const source = sources.find(s => `IND-${s.product_id}` === product.sku);
    if (!source) fail(`Missing source for ${product.sku}`);
    const match = product.image_url?.match(/^\/catalog\/indoteknik\/([\w-]+\.(jpg|png|webp|gif))$/);
    if (!match) fail(`Invalid source image for ${product.sku}`);
    const filename = match[1];
    const bytes = await fs.readFile(path.join(root, 'Scraper/indoteknik_output/images', filename));
    const contentType = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }[match[2]];
    images.push({ bytes, filename, contentType, source });
  }
  console.log(`Validated 100 products and images (${(images.reduce((n,i) => n+i.bytes.length,0)/1e6).toFixed(2)} MB). Target: ${new URL(url).hostname}`);
  if (!upload && !applyMigration) { console.log('Dry run complete; nothing uploaded. Use --upload after the storefront SQL migration.'); return; }
  if (!secret) fail('Add SUPABASE_SERVICE_ROLE_KEY to .env.supabase.local. Do not use a VITE_ prefix.');
  if (secret === publicKey || secret.startsWith('sb_publishable_')) fail('An administrative service key is required; the public key cannot perform this import.');
  const clientOptions = { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(45000) }) } };
  const admin = createClient(url, secret, clientOptions);
  const publicClient = createClient(url, publicKey, clientOptions);
  if (applyMigration) {
    if (!managementToken) fail('SUPABASE_ACCESS_TOKEN is required for --apply-migration, or run supabase/migrations/20260914090000_storefront.sql in the dashboard SQL Editor.');
    const probe = await admin.from('products').select('is_active').limit(0);
    if (!probe.error) fail('Storefront columns already exist; refusing to reapply the non-idempotent migration.');
    if (probe.error.code !== '42703') fail(`Schema preflight failed: ${probe.error.message}`);
    const projectRef = new URL(url).hostname.split('.')[0];
    const compatibility = await fs.readFile(path.join(root, 'supabase/migrations/20260914085900_legacy_catalog_compat.sql'), 'utf8');
    const storefront = await fs.readFile(path.join(root, 'supabase/migrations/20260914090000_storefront.sql'), 'utf8');
    // Keep both schema adaptations inside one transaction.
    const migration = compatibility.replace(/\ncommit;\s*$/, '\n') + storefront.replace(/\nbegin;\s*/, '\n');
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST', headers: { Authorization: `Bearer ${managementToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: migration }), signal: AbortSignal.timeout(60000),
    });
    if (!response.ok) fail(`Migration failed with HTTP ${response.status}: ${(await response.text()).slice(0, 2000)}; import stopped.`);
    console.log('Storefront migration applied.');
  }
  const columns = 'id,sku,name_id,name_en,description_id,description_en,category,brand,image_url,is_featured,created_at,updated_at,price_idr,unit,availability,specifications,is_active';
  check(await admin.from('products').select(columns).limit(0), 'Schema preflight (apply the storefront SQL migration first)');
  if (!upload) return;
  const skus = products.map(p => p.sku);
  const existing = check(await admin.from('products').select('id,sku').in('sku', skus), 'Read existing imports');
  const buckets = check(await admin.storage.listBuckets(), 'Storage access');
  const foundBucket = buckets.find(b => b.id === bucket);
  if (foundBucket && !foundBucket.public) fail(`Bucket ${bucket} is private; stopped without changing its visibility.`);
  if (!foundBucket) check(await admin.storage.createBucket(bucket, { public: true, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], fileSizeLimit: 5242880 }), 'Create product image bucket');
  const rows = [];
  for (let i=0; i<products.length; i++) {
    const product = products[i];
    const image = images[i];
    const objectPath = `sample-100/${image.filename}`;
    check(await admin.storage.from(bucket).upload(objectPath, image.bytes, { contentType: image.contentType, upsert: true, cacheControl: '3600' }), `Upload ${product.sku}`);
    const publicUrl = admin.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
    const response = await fetch(publicUrl, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) fail(`Image verification failed for ${product.sku}: HTTP ${response.status}`);
    const downloaded = Buffer.from(await response.arrayBuffer());
    if (!downloaded.equals(image.bytes)) fail(`Image bytes do not match for ${product.sku}`);
    const { created_at, updated_at, ...data } = product;
    rows.push({ ...data, id: existing.find(p => p.sku === product.sku)?.id || stableId(product.sku), image_url: publicUrl });
    if ((i+1)%10 === 0) console.log(`Uploaded and verified ${i+1}/100 images.`);
  }
  check(await admin.from('products').upsert(rows, { onConflict: 'sku' }), 'Upsert 100 products');
  const stored = productSchema.array().parse(check(await publicClient.from('products').select('*').in('sku', skus).eq('is_active', true), 'Public catalog verification'));
  if (stored.length !== 100) fail(`Expected 100 publicly visible imports; found ${stored.length}.`);
  for (const row of rows) {
    const actual = stored.find(p => p.sku === row.sku);
    for (const key of ['id', 'name_id', 'price_idr', 'image_url', 'category', 'brand', 'availability']) {
      if (actual[key] !== row[key]) fail(`Stored ${key} mismatch for ${row.sku}`);
    }
  }
  await fs.writeFile(path.join(root, 'artifacts/supabase-import-receipt.json'), JSON.stringify({ host: new URL(url).hostname, verifiedAt: new Date().toISOString(), count: stored.length, products: stored.map(p => ({ id: p.id, sku: p.sku, image_url: p.image_url })) }, null, 2));
  console.log('SUCCESS: 100 products and 100 remote images verified using public access.');
}
main().catch(error => {
  let message = error.message;
  for (const sensitive of [secret, managementToken, publicKey]) if (sensitive) message = message.replaceAll(sensitive, '[redacted]');
  console.error(message); process.exitCode = 1;
});
