import { useEffect } from 'react';

/** Sets the browser tab title, for example "Products · Super Portal". */
export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · Super Portal`;
  }, [title]);
}
