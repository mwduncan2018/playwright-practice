interface Props<F extends string> {
  field: F;
  label: string;
  sort: F;
  order: 'asc' | 'desc';
  onSort(field: F): void;
  className?: string;
}

/** A column header that sorts the table. aria-sort says which way the column is sorted. */
export function SortableHeader<F extends string>({ field, label, sort, order, onSort, className }: Props<F>) {
  const active = field === sort;
  return (
    <th scope="col" className={className} aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : undefined}>
      <button
        type="button"
        className="btn btn-link p-0 text-reset text-decoration-none sort-button"
        onClick={() => onSort(field)}
      >
        {label}
        <span aria-hidden="true" className="ms-1 small text-body-secondary">
          {active ? (order === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  );
}
