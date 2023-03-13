import { useRef, useEffect, useCallback } from 'react';

export function useNextTick(wait?: number) {
  const delay = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextTick = useCallback(
    (fn: () => void) => {
      if (delay.current) {
        clearTimeout(delay.current);
        delay.current = null;
      }
      delay.current = setTimeout(fn, wait || 0);
    },
    [wait]
  );

  // unmount
  useEffect(() => {
    return () => {
      if (delay.current) clearTimeout(delay.current);
    };
  }, []);

  return nextTick;
}
