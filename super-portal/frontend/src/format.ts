/** For example "2026-11-06 14:03 UTC". Times are shown in UTC so they read the same everywhere. */
export function formatDateTime(iso: string): string {
  const text = new Date(iso).toISOString();
  return `${text.slice(0, 10)} ${text.slice(11, 16)} UTC`;
}

/** The UTC date, for example "2026-11-06". */
export function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/** For example "1 request" or "12 requests". */
export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** "Showing 11–20 of 60 requests", or the empty message when nothing matched. */
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

/** How long since a time, in whole days: "Less than a day", "1 day", "4 days". */
export function waitingTime(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days < 1 ? 'Less than a day' : plural(days, 'day');
}

/** A date in the browser's time zone as YYYY-MM-DD, the format date inputs use. 0 is today. */
export function localDate(daysFromToday = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
