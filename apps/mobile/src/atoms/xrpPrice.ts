import { atomWithObservable } from 'jotai/utils';
import { BehaviorSubject, defer, delay, expand, from, interval, of, throwError } from 'rxjs';
import {
  catchError,
  filter,
  map,
  startWith,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { appReadyAtom, appStateAtom } from '~/atoms/app';
import { globalStore } from '~/state/store';

const FALLBACK_PRICE = 2.0;
const WORKER_URL = 'https://xrp-price-worker.deem-app.workers.dev';
const MAX_RETRIES = 4;
const BASE_DELAY_MS = 1000;
const POLL_INTERVAL_MS = 60000;

export const fetchXrpPrice = async (): Promise<number> => {
  try {
    const res = await fetch(WORKER_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    const json = await res.json();
    console.log('📦 Fetched JSON:', json);

    if (!json || typeof json.price !== 'number') {
      throw new Error('Invalid API response');
    }

    return json.price;
  } catch (err) {
    console.warn('[⚠️ XRP Fallback]', err);
    return FALLBACK_PRICE;
  }
};

export const xrpPriceMetaAtom = atomWithObservable(
  () => {
    const appReady$ = new BehaviorSubject(globalStore.get(appReadyAtom));
    globalStore.sub(appReadyAtom, () => {
      appReady$.next(globalStore.get(appReadyAtom));
    });

    const appState$ = new BehaviorSubject(globalStore.get(appStateAtom));
    globalStore.sub(appStateAtom, () => {
      appState$.next(globalStore.get(appStateAtom));
    });

    const fetchWithRetry = () => {
      console.log('⚡ Triggering fetchWithRetry...');

      return defer(() => from(fetchXrpPrice())).pipe(
        tap((price) => console.log('✅ Initial fetch price:', price)),
        catchError((err) => {
          console.warn('❌ Initial fetch failed:', err);
          return throwError(() => err);
        }),
        expand((_, i) => {
          if (i >= MAX_RETRIES) {
            return throwError(() => new Error('Max retries reached'));
          }

          const delayTime = BASE_DELAY_MS * 2 ** i;
          return defer(() => from(fetchXrpPrice())).pipe(
            delay(delayTime),
            tap((price) => console.log(`🔁 Retry #${i + 1} returned:`, price)),
            catchError(() => throwError(() => new Error('Retry fetch failed')))
          );
        }),
        take(1),
        catchError((err) => {
          console.warn('⚠️ Falling back to default price after retries:', err);
          return of(FALLBACK_PRICE);
        }),
        tap((finalPrice) => console.log('🌟 Final price used:', finalPrice))
      );
    };

    return interval(POLL_INTERVAL_MS).pipe(
      startWith(0), // fetch immediately
      withLatestFrom(appReady$, appState$),
      filter(([_, ready, appState]) => ready && appState === 'active'),
      switchMap(() => fetchWithRetry()),
      map((price) => ({
        price,
        lastUpdated: new Date(),
        isFresh: true,
      }))
    );
  },
  {
    initialValue: {
      price: FALLBACK_PRICE,
      lastUpdated: new Date(),
      isFresh: false,
    },
  }
);
