/* The deck's service worker — makes the talk survive a dead conference Wi-Fi.
 *
 * GENERATED into dist/sw.js by the `offline` plugin in vite.config.ts, which
 * fills in __FILES__ (every file of the build, relative to the scope) and
 * __VERSION__ (a hash of that list). Do not edit dist/sw.js by hand.
 *
 * - install:  downloads EVERY file of the build (videos included) into one cache
 *             and reports progress to the page («⇣ 42%» in the talk track).
 *             Hashed assets already in the cache are kept, so a redeploy only
 *             downloads what changed.
 * - activate: drops files that are no longer part of the build, takes control
 *             of open pages at once.
 * - fetch:    same-origin GETs come from the cache (a Range request — how
 *             <video> asks — is answered with a 206 slice of the cached file);
 *             the page itself is network-first with a short timeout, so a
 *             redeploy still reaches a connected laptop but a dead network
 *             falls back to the cached deck instead of hanging.
 */
const VERSION = '__VERSION__';
const FILES = __FILES__;
const CACHE = 'deck';
const NAV_TIMEOUT_MS = 2500;

const scope = new URL(self.registration.scope);
const toUrl = (f) => new URL(f, scope).href;
const INDEX = toUrl('index.html');
const ALL = FILES.map(toUrl);
// Vite's content-hashed assets never change under the same name; everything
// else (index.html, favicon…) is re-downloaded on every install.
const isHashed = (url) => /\/assets\//.test(url);

async function broadcast(msg) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const c of clients) c.postMessage(msg);
}

async function status() {
  const cache = await caches.open(CACHE);
  const keys = new Set((await cache.keys()).map((r) => r.url));
  const done = ALL.filter((u) => keys.has(u)).length;
  return { type: 'offline-status', version: VERSION, done, total: ALL.length };
}

async function precache() {
  const cache = await caches.open(CACHE);
  const have = new Set((await cache.keys()).map((r) => r.url));
  // index.html goes in last: it must never point at assets that are not cached yet.
  const todo = ALL.filter((u) => u !== INDEX && !(isHashed(u) && have.has(u)));
  let done = ALL.length - todo.length - 1;
  const total = ALL.length;
  await broadcast({ type: 'offline-status', version: VERSION, done, total });

  let i = 0;
  async function worker() {
    while (i < todo.length) {
      const url = todo[i++];
      const res = await fetch(url, { cache: 'reload' });
      if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
      await cache.put(url, res);
      done++;
      await broadcast({ type: 'offline-status', version: VERSION, done, total });
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);

  const index = await fetch(INDEX, { cache: 'reload' });
  if (!index.ok) throw new Error(`index.html: HTTP ${index.status}`);
  await cache.put(INDEX, index);
  await broadcast({ type: 'offline-status', version: VERSION, done: total, total });
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set(ALL);
      const cache = await caches.open(CACHE);
      for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req);
      await self.clients.claim();
      await broadcast(await status());
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'offline-status?') {
    event.waitUntil(status().then((s) => event.source?.postMessage(s)));
  }
});

/** Answer a Range request from a full cached response. */
async function sliced(request, response) {
  const range = /bytes=(\d*)-(\d*)/.exec(request.headers.get('range') || '');
  if (!range) return response;
  const blob = await response.blob();
  const size = blob.size;
  let start = range[1] === '' ? NaN : Number(range[1]);
  let end = range[2] === '' ? NaN : Number(range[2]);
  if (Number.isNaN(start)) {
    // «bytes=-N»: the last N bytes.
    start = Math.max(0, size - (Number.isNaN(end) ? 0 : end));
    end = size - 1;
  } else if (Number.isNaN(end) || end >= size) {
    end = size - 1;
  }
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  const headers = new Headers(response.headers);
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  headers.set('Accept-Ranges', 'bytes');
  return new Response(blob.slice(start, end + 1), { status: 206, statusText: 'Partial Content', headers });
}

async function fromCache(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request.url);
  if (hit) return request.headers.has('range') ? sliced(request, hit) : hit;
  const res = await fetch(request);
  // Anything of ours that slipped past the precache list is kept for next time.
  if (res.ok && res.status === 200 && !request.headers.has('range')) cache.put(request.url, res.clone());
  return res;
}

async function page(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NAV_TIMEOUT_MS)),
    ]);
    if (res.ok) return res;
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    const cached = await cache.match(INDEX);
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return; // Plausible etc.
  event.respondWith(request.mode === 'navigate' ? page(request) : fromCache(request));
});
