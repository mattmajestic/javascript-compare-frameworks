// Fire-and-forget calls to the Vercel functions in /api, which write to
// Airtable. Everything here is a no-op outside a browser, and failures are
// swallowed: local dev servers have no /api, and the demos must keep working
// offline. localStorage stays the source of truth for the UI.

/** The demo's framework id, from the `data-framework` attribute every app renders. */
export function currentFramework() {
  return globalThis.document?.querySelector('[data-framework]')?.getAttribute('data-framework') ?? null;
}

export function post(path, body) {
  const { location, fetch } = globalThis;
  if (!location?.protocol.startsWith('http') || !fetch) return;
  // Trailing slash: vercel.json's trailingSlash would otherwise 308-redirect.
  fetch(`/api/${path}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}
