/**
 * Pages the tests must never open. The site root and /strategies/ redirect to the
 * Strategies page, so they are protected too.
 */
export const PROTECTED_PATHS: ReadonlySet<string> = new Set([
  '/',
  '/strategies',
  '/strategies/',
  '/strategies/index.html', // Strategies
  '/strategies/selected.html', // Selected Strategies
  '/strategies/rejected.html', // Rejected Strategies
  '/strategies/selected_after_tax.html', // Selected After Cost & Tax
  '/strategies/after_tax.html', // After Cost & Tax
  '/strategies/rejected_after_tax.html', // Rejected After Cost & Tax
]);

/** Requests that only read. Anything else (the "Rebuild pages" button's POST, say) could change the site. */
const READ_ONLY_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Why a browser request must be blocked, or null when it may go ahead.
 * Only requests to the site under test are checked.
 */
export function blockReason(method: string, url: string, siteOrigin: string): string | null {
  const target = new URL(url);
  if (target.origin !== siteOrigin) return null;

  // The server runs on Windows, where paths are case-insensitive.
  const path = decodeURIComponent(target.pathname).toLowerCase();
  if (PROTECTED_PATHS.has(path)) return `opened protected page ${target.pathname}`;
  if (!READ_ONLY_METHODS.has(method)) return `sent ${method} ${target.pathname}, which could change the site`;
  return null;
}
