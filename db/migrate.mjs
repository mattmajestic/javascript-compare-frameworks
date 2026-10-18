// Bring the Airtable base in line with db/schema.mjs.
// Usage: npm run db:migrate   (reads AIRTABLE_TOKEN and AIRTABLE_BASE_ID from .env)
// Needs the token scopes schema.bases:read and schema.bases:write.

import { TABLES } from './schema.mjs';

const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = process.env;
if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
  console.error('Set AIRTABLE_TOKEN and AIRTABLE_BASE_ID in .env first.');
  process.exit(1);
}

const meta = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}`;

async function airtable(path, init = {}) {
  const res = await fetch(`${meta}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status} ${JSON.stringify(body.error ?? body)}`);
  return body;
}

const { tables: existing } = await airtable('/tables');

for (const table of TABLES) {
  const current = existing.find((t) => t.name === table.name);

  if (!current) {
    await airtable('/tables', { method: 'POST', body: JSON.stringify(table) });
    console.log(`✔ created table "${table.name}" with ${table.fields.length} fields`);
    continue;
  }

  for (const field of table.fields) {
    const found = current.fields.find((f) => f.name === field.name);
    if (!found) {
      await airtable(`/tables/${current.id}/fields`, { method: 'POST', body: JSON.stringify(field) });
      console.log(`✔ ${table.name}: added field "${field.name}"`);
    } else if (found.type !== field.type) {
      console.warn(`⚠ ${table.name}: "${field.name}" is ${found.type}, schema wants ${field.type}. Fix it in Airtable.`);
    }
  }
  console.log(`✔ table "${table.name}" is up to date`);
}
