const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatPrice(value: number): string {
  return money.format(value);
}

/** For example "2026-11-06 14:03 UTC". Times are shown in UTC so they read the same everywhere. */
export function formatDateTime(iso: string): string {
  const text = new Date(iso).toISOString();
  return `${text.slice(0, 10)} ${text.slice(11, 16)} UTC`;
}

/** For example "1 product" or "12 products". */
export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** "Showing 11–20 of 60 products", or the empty message when nothing matched. */
export function showing(
  page: number,
  pageSize: number,
  total: number,
  one: string,
  empty: string,
  many = `${one}s`,
): string {
  if (total === 0) return empty;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  return `Showing ${first}–${last} of ${plural(total, one, many)}`;
}
