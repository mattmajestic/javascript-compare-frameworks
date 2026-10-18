// Vercel serverless function: POST /api/events/
// The demos call this when custom countdowns are added or removed, and it
// upserts them into Airtable. The token never leaves the server.
//
// Body: { framework: 'react', events: [{ id, name, date: 'YYYY-MM-DD', status: 'active' | 'deleted' }] }

import { FRAMEWORKS, NAME_MAX_LENGTH } from '../packages/core/src/index.js';
import { EVENTS_FIELDS as F, EVENTS_TABLE, STATUS } from '../db/schema.mjs';
import { airtable, config, json, readBody } from './_airtable.js';

const MAX_EVENTS = 10; // Airtable's per-request record limit.

const isEvent = (e) =>
  typeof e?.id === 'string' && /^custom-[a-z0-9]{1,24}$/.test(e.id) &&
  typeof e.name === 'string' && e.name.trim().length > 0 && e.name.length <= NAME_MAX_LENGTH &&
  typeof e.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
  (e.status === 'active' || e.status === 'deleted');

export async function POST(request) {
  const cfg = config();
  if (cfg.error) return cfg.error;
  const { body, error } = await readBody(request);
  if (error) return error;

  const events = Array.isArray(body?.events) ? body.events : [];
  if (events.length === 0 || events.length > MAX_EVENTS || !events.every(isEvent)) {
    return json(400, { error: `Send 1–${MAX_EVENTS} valid events.` });
  }
  const framework = FRAMEWORKS.find((f) => f.id === body.framework)?.name;

  const now = new Date().toISOString();
  const records = events.map((e) => ({
    fields: {
      [F.eventId]: e.id,
      [F.name]: e.name.trim(),
      [F.date]: e.date,
      [F.status]: e.status === 'deleted' ? STATUS.deleted : STATUS.active,
      ...(e.status === 'deleted' ? { [F.deletedAt]: now } : { [F.createdAt]: now }),
      ...(framework && e.status === 'active' ? { [F.framework]: framework } : {}),
    },
  }));

  try {
    await airtable(cfg, EVENTS_TABLE, {
      method: 'PATCH',
      body: JSON.stringify({ performUpsert: { fieldsToMergeOn: [F.eventId] }, records, typecast: true }),
    });
  } catch (err) {
    console.error(err);
    return json(502, { error: 'Could not save to Airtable.' });
  }
  return new Response(null, { status: 204 });
}
