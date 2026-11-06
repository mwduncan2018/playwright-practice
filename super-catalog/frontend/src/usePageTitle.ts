import { useEffect } from 'react';

/** Sets the browser tab title, for example "Products · Super Catalog". */
export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · Super Catalog`;
  }, [title]);
}
