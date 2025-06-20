// atoms/xrp.ts
import { atom } from 'jotai';
import { atomWithObservable } from 'jotai/utils';
import { from, interval, shareReplay, startWith, switchMap } from 'rxjs';

const WORKER_URL = 'https://xrp-price-worker.deem-app.workers.dev';
const FALLBACK_PRICE = 2.0;
const TIMEOUT_MS = 3000;

const fetchWithTimeout = (url: string, timeout = TIMEOUT_MS): Promise<Response> => {
  return Promise.race([
    fetch(url, { method: 'GET', headers: { Accept: 'application/json' } }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout while fetching XRP price')), timeout)
    ),
  ]) as Promise<Response>;
};

let hasWarned = false;

export const fetchXrpPrice = async (): Promise<number> => {
  try {
    const res = await fetchWithTimeout(WORKER_URL, TIMEOUT_MS);

    // Use text first to log raw response safely
    const text = await res.text();
    const json = JSON.parse(text);

    if (!json || typeof json.price !== 'number') throw new Error('Invalid API response');

    return json.price;
  } catch (err) {
    if (!hasWarned) {
      console.warn('[⚠️ XRP Price Fallback]', err);
      hasWarned = true;
    }
    return FALLBACK_PRICE;
  }
};

// 🧠 Initial one-time fetch (useful if you want SSR or static fallback too)
export const xrpInitialPriceAtom = atom(fetchXrpPrice());

// 🔁 Live polling atom (once every 60s production / 30s dev)
export const xrpPriceAtom = atomWithObservable(() => {
  return interval(__DEV__ ? 30000 : 60000).pipe(
    startWith(0),
    switchMap(() => from(fetchXrpPrice())),
    shareReplay(1) // ✅ emit most recent value to new subscribers
  );
});
