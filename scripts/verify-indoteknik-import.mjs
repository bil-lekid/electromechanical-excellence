// Read-only audit of the completed bulk import, using the public storefront key.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const artifacts = path.join(root, 'artifacts');
const env = loadEnv('production', root, 'VITE_');
async function main() {
  const receipt = JSON.parse(await fs.readFile(path.join(artifacts, 'indoteknik-bulk-receipt.json'), 'utf8'));
  if (!receipt.complete) throw new Error('Bulk import is not complete yet.');
  const { sourceRows } = JSON.parse(await fs.readFile(path.join(artifacts, 'indoteknik-bulk-sources.json'), 'utf8'));
  const checkpoint = JSON.parse(await fs.readFile(path.join(artifacts, 'indoteknik-bulk-checkpoint.json'), 'utf8'));
  if (checkpoint.host !== env.VITE_SUPABASE_URL) throw new Error('Project mismatch.');
  const expected = new Map();
  for (const row of sourceRows) if (!expected.has(`IND-${row.product_id}`)) expected.set(`IND-${row.product_id}`, row);
  const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(60000) }) },
  });
  const seen = new Set(); let images = 0;
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client.from('products').select('sku,name_id,price_idr,image_url,is_active,availability')
      .like('sku', 'IND-%').order('sku').range(offset, offset + 999);
    if (error) throw new Error(error.message);
    for (const actual of data) {
      const source = expected.get(actual.sku);
      if (!source || seen.has(actual.sku)) throw new Error(`Unexpected/duplicate SKU ${actual.sku}`);
      seen.add(actual.sku);
      let imageUrl = '';
      if (source.image_status === 'downloaded') {
        const digest = checkpoint.images[actual.sku];
        if (!digest) throw new Error(`Missing verified image ${actual.sku}`);
        const object = `catalog/${source.product_id}-${digest.slice(0,16)}${path.extname(source.image_local_path)}`;
        imageUrl = client.storage.from('indoteknik-products').getPublicUrl(object).data.publicUrl;
        images++;
      }
      if (actual.name_id !== source.product_name || actual.price_idr !== source.price || actual.image_url !== imageUrl || !actual.is_active || actual.availability !== 'on_request') {
        throw new Error(`Source mismatch ${actual.sku}`);
      }
    }
    if (data.length < 1000) break;
  }
  if (seen.size !== expected.size || seen.size !== receipt.total) throw new Error(`Incomplete catalog: ${seen.size}/${expected.size}`);
  const result = { host: new URL(env.VITE_SUPABASE_URL).hostname, sourceRows: sourceRows.length, uniqueProducts: seen.size,
    mergedDuplicates: sourceRows.length - seen.size, productsWithImages: images, productsWithoutImages: seen.size - images,
    publicAccessVerified: true, verifiedAt: new Date().toISOString() };
  await fs.writeFile(path.join(artifacts, 'indoteknik-bulk-verification.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
}
main().catch(error => { console.error(error.message.replaceAll(env.VITE_SUPABASE_PUBLISHABLE_KEY || 'UNSET', '[redacted]')); process.exitCode = 1; });
