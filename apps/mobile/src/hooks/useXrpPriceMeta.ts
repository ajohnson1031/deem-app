import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

import { xrpPriceMetaAtom } from '~/atoms';

export function useXrpPriceMeta() {
  const { price, lastUpdated } = useAtomValue(xrpPriceMetaAtom);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsedMs = now - lastUpdated.getTime();
  const elapsedSec = Math.floor(elapsedMs / 1000);
  const secondsUntilNextUpdate = Math.max(0, 60 - elapsedSec);
  const timeSinceLastUpdate =
    elapsedSec < 60 ? `${elapsedSec}s ago` : `${Math.floor(elapsedSec / 60)}m ago`;
  const isFresh = elapsedSec < 45;

  return {
    price,
    lastUpdated,
    timeSinceLastUpdate,
    secondsUntilNextUpdate,
    isFresh,
  };
}
