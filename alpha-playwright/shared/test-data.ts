import { randomInt } from 'node:crypto';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * A value no other test or run will produce, for names that must be unique: tests run in parallel
 * and share one environment, so two tests must never create the same record.
 */
export function uniqueSuffix(): string {
  const time = Date.now().toString(36);
  const random = randomInt(36 ** 3)
    .toString(36)
    .padStart(3, '0');
  return `${time}${random}`.toUpperCase();
}

/** A SKU no sample product uses and no other run is likely to: Z, two random letters, a dash, four digits. */
export function uniqueSku(): string {
  const letters = Array.from({ length: 2 }, () => LETTERS[randomInt(LETTERS.length)]).join('');
  return `Z${letters}-${String(randomInt(10_000)).padStart(4, '0')}`;
}

/** A date counted from today in this machine's time zone (the browser's too), as date inputs take it. */
export function dateFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
