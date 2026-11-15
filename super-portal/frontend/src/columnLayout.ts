import { REQUEST_COLUMNS, type RequestColumnKey } from './components/RequestsTable';

/** One column of the All requests table: whether it's shown. The list's order is the table's order. */
export interface ColumnChoice {
  key: RequestColumnKey;
  shown: boolean;
}

/** The request number identifies the row and links to the request, so it can move but not hide. */
export const ALWAYS_SHOWN: RequestColumnKey = 'number';

const SHOWN_BY_DEFAULT: RequestColumnKey[] = [
  'number',
  'title',
  'type',
  'requester',
  'priority',
  'status',
  'submitted',
];

export function defaultColumnChoices(): ColumnChoice[] {
  return REQUEST_COLUMNS.map((column) => ({ key: column.key, shown: SHOWN_BY_DEFAULT.includes(column.key) }));
}

/** Saved in this browser for each user, so a choice lasts until it's changed or the browser's data is cleared. */
function storageKey(username: string): string {
  return `super-portal.all-requests-columns.${username}`;
}

/**
 * The user's saved columns, or the defaults. Columns the app no longer has are dropped, and
 * columns it has added since are put at the end, hidden.
 */
export function loadColumnChoices(username: string): ColumnChoice[] {
  let saved: unknown;
  try {
    saved = JSON.parse(localStorage.getItem(storageKey(username)) ?? 'null');
  } catch {
    saved = null;
  }
  if (!Array.isArray(saved)) return defaultColumnChoices();

  const choices: ColumnChoice[] = [];
  for (const item of saved) {
    const key = (item as Partial<ColumnChoice> | null)?.key;
    const column = REQUEST_COLUMNS.find((known) => known.key === key);
    if (column && !choices.some((choice) => choice.key === column.key)) {
      choices.push({ key: column.key, shown: column.key === ALWAYS_SHOWN || (item as ColumnChoice).shown === true });
    }
  }
  for (const column of REQUEST_COLUMNS) {
    if (!choices.some((choice) => choice.key === column.key)) {
      choices.push({ key: column.key, shown: column.key === ALWAYS_SHOWN });
    }
  }
  return choices;
}

export function saveColumnChoices(username: string, choices: ColumnChoice[]): void {
  try {
    localStorage.setItem(storageKey(username), JSON.stringify(choices));
  } catch {
    // Storage is blocked or full. The choice still applies until the page is reloaded.
  }
}

export function shownColumns(choices: ColumnChoice[]): RequestColumnKey[] {
  return choices.filter((choice) => choice.shown).map((choice) => choice.key);
}
