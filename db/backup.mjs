// Download every table in the Airtable base to db/backups/airtable-<time>.json.
// Usage: npm run db:backup   (reads .env; needs schema.bases:read + data.records:read)
//
// Backups include event names that visitors typed, so db/backups/ is
// gitignored. Keep them somewhere private.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const { AIRTABLE_TOKEN: token, AIRTABLE_BASE_ID: baseId } = process.env;
if (!token || !baseId) {
  console.error('Set AIRTABLE_TOKEN and AIRTABLE_BASE_ID in .env first.');
  process.exit(1);
}

const headers = { Authorization: `Bearer ${token}` };
async function get(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${await res.text()}`);
  return res.json();
}

const { tables } = await get(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`);
const backup = { baseId, exportedAt: new Date().toISOString(), tables: {} };

for (const table of tables) {
  const records = [];
  let offset;
  do {
    const params = new URLSearchParams({ pageSize: '100', ...(offset ? { offset } : {}) });
    const page = await get(`https://api.airtable.com/v0/${baseId}/${table.id}?${params}`);
    records.push(...page.records);
    offset = page.offset;
    // Stay under Airtable's 5 requests/second per base.
    await new Promise((r) => setTimeout(r, 220));
  } while (offset);
  backup.tables[table.name] = { schema: table, records };
  console.log(`✔ ${table.name}: ${records.length} records`);
}

const dir = join(dirname(fileURLToPath(import.meta.url)), 'backups');
mkdirSync(dir, { recursive: true });
const file = join(dir, `airtable-${backup.exportedAt.replace(/[:.]/g, '-')}.json`);
writeFileSync(file, `${JSON.stringify(backup, null, 2)}\n`);
console.log(`\n✔ Saved ${relative(process.cwd(), file)}`);
