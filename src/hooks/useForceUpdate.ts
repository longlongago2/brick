import { useState, useCallback } from 'react';

export function useForceUpdate() {
  const [, setState] = useState(0);

  const forceUpdate = useCallback(() => {
    setState((n) => n + 1);
  }, []);

  return forceUpdate;
}
