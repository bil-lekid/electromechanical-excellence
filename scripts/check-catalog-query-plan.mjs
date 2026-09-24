// Read-only verification that the deployed index supports the catalog's search.
import fs from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { loadEnv } from 'vite';
const env = loadEnv('production', process.cwd(), '');
const secrets = parseEnv(await fs.readFile('.env.supabase.local', 'utf8'));
const token = secrets.SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN;
async function main() {
  if (!token) throw new Error('SUPABASE_ACCESS_TOKEN is required.');
  const ref = new URL(env.VITE_SUPABASE_URL).hostname.split('.')[0];
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: "explain (analyze, buffers, format json) select id from public.products where is_active and search_text ilike '%bosch%' and search_text ilike '%drill%' order by is_featured desc nulls last, created_at desc, id limit 12;" }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Query plan HTTP ${response.status}`);
  const result = await response.json();
  await fs.writeFile('artifacts/catalog-query-plan.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
}
main().catch(error => { console.error(token ? error.message.replaceAll(token, '[redacted]') : error.message); process.exitCode = 1; });
