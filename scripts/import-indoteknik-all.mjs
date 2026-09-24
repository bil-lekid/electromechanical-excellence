// Bulk, resumable import. Credentials remain server-side; no schema changes.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'Scraper/indoteknik_output');
const artifacts = path.join(root, 'artifacts');
const bucket = 'indoteknik-products';
const write = process.argv.includes('--upload');
const env = loadEnv('production', root, 'VITE_');
const privateEnv = loadEnv('production', root, 'SUPABASE_');
const secrets = parseEnv(await fs.readFile(path.join(root, '.env.supabase.local'), 'utf8'));
const url = env.VITE_SUPABASE_URL;
const key = secrets.SUPABASE_SERVICE_ROLE_KEY || privateEnv.SUPABASE_SERVICE_ROLE_KEY;
const checkpointPath = path.join(artifacts, 'indoteknik-bulk-checkpoint.json');
const receiptPath = path.join(artifacts, 'indoteknik-bulk-receipt.json');
const mime = { '.jpg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function stableId(sku) {
  const bytes = createHash('sha1').update(`ppp:indoteknik:${sku}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50; bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = bytes.toString('hex');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
function check(result) { if (result.error) throw new Error(result.error.message); return result.data; }
async function retry(action) {
  for (let n = 0; ; n++) {
    try { return await action(); } catch (error) {
      if (n === 4) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** n));
    }
  }
}
async function save(file, data) {
  await fs.writeFile(`${file}.tmp`, JSON.stringify(data));
  await fs.rename(`${file}.tmp`, file);
}
async function main() {
  if (write && !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is empty or unavailable; no remote changes made.');
  await fs.mkdir(artifacts, { recursive: true });
  const db = new DatabaseSync(path.join(output, 'catalog.sqlite3'), { readOnly: true });
  const sourceRows = db.prepare("SELECT * FROM products ORDER BY product_id, (image_status='downloaded') DESC, length(product_name) DESC, product_url").all();
  const unique = new Map();
  for (const row of sourceRows) if (!unique.has(row.product_id)) unique.set(row.product_id, row);
  const products = [...unique.values()];
  const relationships = db.prepare('SELECT r.product_url,c.name FROM relationships r JOIN categories c ON c.url=r.category_url ORDER BY c.name').all();
  db.close();
  const categories = new Map();
  for (const rel of relationships) {
    if (!categories.has(rel.product_url)) categories.set(rel.product_url, []);
    categories.get(rel.product_url).push(rel.name);
  }
  await save(path.join(artifacts, 'indoteknik-bulk-sources.json'), { sourceRows, relationships });
  const skus = new Set(); let imageBytes = 0; let imageCount = 0;
  for (const p of products) {
    p.sku = `IND-${p.product_id}`;
    if (skus.has(p.sku) || !p.product_name || (p.price !== null && p.price < 0)) throw new Error(`Invalid/duplicate product ${p.sku}`);
    skus.add(p.sku);
    if (p.image_status === 'downloaded') {
      p.localImage = path.resolve(output, p.image_local_path);
      if (!p.localImage.startsWith(path.resolve(output, 'images') + path.sep) || !mime[path.extname(p.localImage)]) throw new Error(`Invalid image path ${p.sku}`);
      const stat = await fs.stat(p.localImage);
      if (!stat.size || stat.size > 5242880) throw new Error(`Unsupported image size ${p.sku}`);
      imageBytes += stat.size; imageCount++;
    }
  }
  console.log(JSON.stringify({ sourceRows: sourceRows.length, products: products.length, mergedDuplicateIds: sourceRows.length-products.length, images: imageCount, imageMB: +(imageBytes / 1e6).toFixed(2), withoutPhoto: products.length - imageCount, host: new URL(url).hostname }));
  if (!write) { console.log('Dry run passed; use --upload to import.'); return; }
  if (!key || key === env.VITE_SUPABASE_PUBLISHABLE_KEY) throw new Error('Administrative key required');
  const options = { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(60000) }) } };
  const admin = createClient(url, key, options);
  const publicClient = createClient(url, env.VITE_SUPABASE_PUBLISHABLE_KEY, options);
  check(await admin.from('products').select('id,sku,price_idr,image_url').limit(0));
  const found = check(await admin.storage.listBuckets()).find(b => b.id === bucket);
  if (!found?.public) throw new Error('Existing public indoteknik-products bucket required');
  const existing = new Map();
  for (let offset = 0; ; offset += 1000) {
    const rows = check(await retry(() => admin.from('products').select('id,sku,category,is_featured,image_url').like('sku', 'IND-%').order('sku').range(offset, offset + 999).then(r => ({ data: check(r) }))));
    for (const row of rows) existing.set(row.sku, row);
    if (rows.length < 1000) break;
  }
  let checkpoint = { host: url, images: {} };
  try { checkpoint = JSON.parse(await fs.readFile(checkpointPath, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (checkpoint.host !== url) throw new Error('Checkpoint belongs to a different project');
  const started = Date.now(); let verified = 0;
  async function commit(rows) {
    await save(checkpointPath, checkpoint);
    await retry(async () => check(await admin.from('products').upsert(rows, { onConflict: 'sku' })));
    const stored = await retry(async () => check(await publicClient.from('products').select('*').in('sku', rows.map(r => r.sku))));
    const bySku = new Map(stored.map(r => [r.sku, r]));
    for (const row of rows) {
      const actual = bySku.get(row.sku);
      for (const field of Object.keys(row)) {
        if (JSON.stringify(actual?.[field]) !== JSON.stringify(row[field])) throw new Error(`Public verification failed: ${row.sku}.${field}`);
      }
    }
    verified += rows.length;
    await save(receiptPath, { host: new URL(url).hostname, verified, total: products.length, images: Object.keys(checkpoint.images).length, complete: verified === products.length, updatedAt: new Date().toISOString() });
    console.log(`[${new Date().toISOString()}] Verified ${verified}/${products.length} products; images ${Object.keys(checkpoint.images).length}/${imageCount}; elapsed ${Math.round((Date.now()-started)/1000)}s`);
  }
  let next = 0; let pending = []; let writes = Promise.resolve(); let failure;
  function enqueue(rows) {
    writes = writes.then(() => { if (!failure) return commit(rows); }).catch(error => { failure ||= error; });
  }
  await Promise.all(Array.from({ length: 64 }, async () => {
    try {
      while (next < products.length && !failure) {
        const p = products[next++]; const old = existing.get(p.sku);
        // Legacy products.image_url is NOT NULL; empty string renders as no image.
        let imageUrl = '';
        if (p.localImage) {
          const bytes = await fs.readFile(p.localImage); const digest = hash(bytes);
          const objectPath = `catalog/${p.product_id}-${digest.slice(0,16)}${path.extname(p.localImage)}`;
          imageUrl = admin.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
          if (checkpoint.images[p.sku] !== digest) {
            await retry(async () => {
              check(await admin.storage.from(bucket).upload(objectPath, bytes, { contentType: mime[path.extname(p.localImage)], upsert: true, cacheControl: '31536000' }));
              const response = await fetch(imageUrl, { signal: AbortSignal.timeout(60000) });
              if (!response.ok || hash(Buffer.from(await response.arrayBuffer())) !== digest) throw new Error(`Image verification failed: ${p.sku}`);
            });
            checkpoint.images[p.sku] = digest;
          }
        }
        pending.push({
          id: old?.id || stableId(p.sku), sku: p.sku, name_id: p.product_name, name_en: '',
          description_id: null, description_en: null, category: old?.category || categories.get(p.product_url)?.[0] || 'Lainnya',
          brand: p.brand || null, image_url: imageUrl, is_featured: old?.is_featured || false,
          price_idr: p.price, unit: 'unit', availability: 'on_request', specifications: {}, is_active: true,
        });
        if (pending.length >= 200) {
          enqueue(pending); pending = [];
          // Backpressure bounds queued product batches while other uploads continue.
          await writes;
        }
      }
    } catch (error) { failure ||= error; }
  }));
  if (pending.length) enqueue(pending);
  await writes;
  await save(checkpointPath, checkpoint);
  if (failure) throw failure;
  console.log('SUCCESS: all source products verified through public Supabase access.');
}
main().catch(error => {
  let message = error.message;
  for (const secret of [key, secrets.SUPABASE_ACCESS_TOKEN, env.VITE_SUPABASE_PUBLISHABLE_KEY]) if (secret) message = message.replaceAll(secret, '[redacted]');
  console.error(message); process.exitCode = 1;
});
