import * as Clipboard from 'expo-clipboard';
import { useCallback, useRef, useState } from 'react';

export function useCopyToClipboard(duration: number = 2000) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        await Clipboard.setStringAsync(text);
        setCopied(true);

        // Clear previous timeout if any
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setCopied(false);
        }, duration);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    },
    [duration]
  );

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCopied(false);
  }, []);

  return { copied, copy, clear };
}
