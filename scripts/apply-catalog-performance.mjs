import fs from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { loadEnv } from 'vite';
const env = loadEnv('production', process.cwd(), '');
const secrets = parseEnv(await fs.readFile('.env.supabase.local', 'utf8'));
const token = secrets.SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN;
async function main() {
  const sql = await fs.readFile('supabase/migrations/20260923090000_catalog_performance.sql', 'utf8');
  if (!process.argv.includes('--apply')) { console.log('Migration ready. Use --apply to install catalog search/indexes and read-only facets.'); return; }
  if (!token) throw new Error('SUPABASE_ACCESS_TOKEN is required to apply the migration.');
  const ref = new URL(env.VITE_SUPABASE_URL).hostname.split('.')[0];
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }), signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) throw new Error(`Migration HTTP ${response.status}: ${await response.text()}`);
  console.log('Applied catalog performance migration.');
}
main().catch(error => { console.error(token ? error.message.replaceAll(token, '[redacted]') : error.message); process.exitCode = 1; });
