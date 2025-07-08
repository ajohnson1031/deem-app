import { getDefaultStore } from 'jotai';
import { atomWithObservable } from 'jotai/utils';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  defer,
  filter,
  from,
  interval,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';

import { appReadyAtom } from './'; // adjust import path as needed

const store = getDefaultStore();

const FALLBACK_PRICE = 2.0;
const WORKER_URL = 'https://xrp-price-worker.deem-app.workers.dev';
const TIMEOUT_MS = 3000;

const fetchWithTimeout = (url: string, timeout = TIMEOUT_MS): Promise<Response> => {
  return Promise.race([
    fetch(url, { method: 'GET', headers: { Accept: 'application/json' } }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout while fetching XRP price')), timeout)
    ),
  ]) as Promise<Response>;
};

export const fetchXrpPrice = async (): Promise<number> => {
  try {
    const res = await fetchWithTimeout(WORKER_URL, TIMEOUT_MS);
    const text = await res.text();
    const json = JSON.parse(text);
    if (!json || typeof json.price !== 'number') throw new Error('Invalid API response');
    return json.price;
  } catch (err) {
    console.warn('[⚠️ XRP Price Fallback]', err);
    return FALLBACK_PRICE;
  }
};

export const xrpPriceAtom = atomWithObservable(() => {
  // Turn the appReadyAtom into a reactive stream
  const appReady$ = new BehaviorSubject(store.get(appReadyAtom));
  store.sub(appReadyAtom, () => {
    appReady$.next(store.get(appReadyAtom));
  });

  return combineLatest([interval(60000).pipe(startWith(0)), appReady$]).pipe(
    filter(([_, ready]) => ready), // only emit when app is ready
    switchMap(() =>
      defer(() =>
        from(fetchXrpPrice()).pipe(
          catchError((err) => {
            console.warn('🔥 Price fetch failed in stream:', err);
            return of(FALLBACK_PRICE);
          })
        )
      )
    ),
    shareReplay(1)
  );
});
