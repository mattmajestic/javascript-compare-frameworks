// Helpers shared by the /api functions. Vercel doesn't route files that
// start with an underscore, so this is a module, not an endpoint.

export const json = (status, body, headers = {}) => Response.json(body, { status, headers });

/** The env config, or a 503 Response if Airtable isn't set up on this deployment. */
export function config() {
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = process.env;
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) return { error: json(503, { error: 'Airtable is not configured.' }) };
  return { token: AIRTABLE_TOKEN, baseId: AIRTABLE_BASE_ID };
}

/**
 * Parse a JSON POST body from a page on this deployment, or return the error
 * Response to send back.
 */
export async function readBody(request, maxBytes = 8_000) {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return { error: json(403, { error: 'Cross-origin request.' }) };
  const raw = await request.text();
  if (raw.length > maxBytes) return { error: json(413, { error: 'Body too large.' }) };
  try {
    return { body: JSON.parse(raw) };
  } catch {
    return { error: json(400, { error: 'Invalid JSON.' }) };
  }
}

/** fetch() against a table, throwing with Airtable's error message on failure. */
export async function airtable({ token, baseId }, table, { query = '', ...init } = {}) {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}${query}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Airtable ${init.method ?? 'GET'} ${table} → ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

/** Every record in a table (following pagination), limited to `fields`. */
export async function listAll(cfg, table, fields) {
  const params = new URLSearchParams({ pageSize: '100' });
  for (const f of fields) params.append('fields[]', f);
  const records = [];
  let offset;
  do {
    if (offset) params.set('offset', offset);
    const page = await airtable(cfg, table, { query: `?${params}` });
    records.push(...page.records);
    offset = page.offset;
  } while (offset);
  return records;
}

/** Coarse browser family from a User-Agent. Nothing more specific is stored. */
export function browserFamily(ua = '') {
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Chrome\/|CriOS\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Other';
}
