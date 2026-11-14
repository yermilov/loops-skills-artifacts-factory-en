/** Offline mode, page side. The service worker (dist/sw.js, generated from
 *  scripts/sw.template.js by the `offline` plugin in vite.config.ts) downloads
 *  the whole deck on the first visit; this registers it and reports how far
 *  it has got, for the mark in the talk track.
 *
 *  Production builds only: in `bun run dev` a cache would serve stale modules. */
import { useEffect, useState } from 'react';

export interface OfflineStatus {
  done: number;
  total: number;
}

type Listener = (s: OfflineStatus) => void;
const listeners = new Set<Listener>();
let last: OfflineStatus | null = null;

function emit(s: OfflineStatus) {
  last = s;
  for (const l of listeners) l(s);
}

export function registerOffline() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  const sw = navigator.serviceWorker;
  sw.addEventListener('message', (event: MessageEvent) => {
    const d = event.data;
    if (d?.type === 'offline-status') emit({ done: d.done, total: d.total });
  });
  // Ask the browser not to evict the cache under storage pressure.
  navigator.storage?.persist?.().catch(() => {});
  sw.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
    .then(async (reg) => {
      // An already installed worker answers how much of THIS build it holds.
      const active = reg.active ?? (await sw.ready).active;
      active?.postMessage({ type: 'offline-status?' });
    })
    .catch((err) => console.warn('offline mode unavailable:', err));
}

export function useOfflineStatus(): OfflineStatus | null {
  const [status, setStatus] = useState(last);
  useEffect(() => {
    listeners.add(setStatus);
    return () => {
      listeners.delete(setStatus);
    };
  }, []);
  return status;
}
