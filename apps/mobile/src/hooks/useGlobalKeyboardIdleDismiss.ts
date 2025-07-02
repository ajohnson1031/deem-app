import { useEffect, useRef } from 'react';
import { Keyboard } from 'react-native';

export const useGlobalKeyboardIdleDismiss = (delay: number = 3000) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      Keyboard.dismiss();
    }, delay);
  };

  const cancelIdleTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => cancelIdleTimer, []);

  return { resetIdleTimer, cancelIdleTimer };
};
