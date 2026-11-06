import { useCallback, useEffect, useState } from 'react';
import type { useSearchParams } from 'react-router';

type SetParams = ReturnType<typeof useSearchParams>[1];
export type UpdateParams = (changes: Record<string, string | null>, keepPage?: boolean) => void;

/**
 * Changes some query parameters and keeps the rest, so filters live in the address and survive a
 * reload. Any change except paging goes back to page 1.
 *
 * It starts from the address as it is now, which navigating updates at once. React Router would
 * start from the parameters of the last render, so a second change made before the page redraws
 * (Clear filters, then Rows per page) would undo the first.
 */
export function useParamUpdater(setParams: SetParams): UpdateParams {
  return useCallback(
    (changes, keepPage = false) => {
      const next = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      }
      if (!keepPage) next.delete('page');
      setParams(next, { replace: true });
    },
    [setParams],
  );
}

/**
 * A filter control tied to a query parameter. The control changes at once, and the address
 * follows after `delay` ms (300 for text boxes, so typing doesn't reload on every key). The
 * control also follows the address when it changes some other way (Clear filters, Back).
 */
export function useParamState(
  params: URLSearchParams,
  key: string,
  update: UpdateParams,
  delay = 0,
): [string, (value: string) => void] {
  const fromAddress = params.get(key) ?? '';
  const [value, setValue] = useState(fromAddress);
  const [seen, setSeen] = useState(fromAddress);
  if (fromAddress !== seen) {
    setSeen(fromAddress);
    setValue(fromAddress);
  }

  useEffect(() => {
    if (value.trim() === fromAddress) return;
    const timer = window.setTimeout(() => update({ [key]: value.trim() || null }), delay);
    return () => window.clearTimeout(timer);
  }, [value, fromAddress, key, update, delay]);

  return [value, setValue];
}
