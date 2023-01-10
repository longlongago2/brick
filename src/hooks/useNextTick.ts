import { useRef, useEffect, useCallback } from 'react';

export function useNextTick(wait?: number) {
  const delay = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextTick = useCallback((fn: () => void) => {
    delay.current = setTimeout(fn, wait || 0);
  }, [wait]);

  useEffect(() => {
    return () => {
      if (delay.current) clearTimeout(delay.current);
    };
  }, []);

  return nextTick;
}
