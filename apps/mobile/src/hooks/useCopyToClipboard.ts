import * as Clipboard from 'expo-clipboard';
import { useCallback, useRef, useState } from 'react';

export function useCopyToClipboard(duration: number = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copy = useCallback(
    async (text: string, key: string) => {
      try {
        await Clipboard.setStringAsync(text);
        setCopiedKey(key);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setCopiedKey(null);
        }, duration);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    },
    [duration]
  );

  const clear = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCopiedKey(null);
  }, []);

  return { copiedKey, copy, clear };
}
