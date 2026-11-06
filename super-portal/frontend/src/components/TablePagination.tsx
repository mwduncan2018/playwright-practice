import { Form, Pagination } from 'react-bootstrap';

interface Props {
  /** Used for element IDs, for example "products". */
  name: string;
  /** The navigation's accessible name, for example "Product pages". */
  label: string;
  page: number;
  pageSize: number;
  total: number;
  onPage(page: number): void;
  /** Leave out to hide the "Rows per page" choice. */
  onPageSize?(pageSize: number): void;
}

const PAGE_SIZES = [10, 25, 50];

export function TablePagination({ name, label, page, pageSize, total, onPage, onPageSize }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const first = Math.max(1, Math.min(page - 2, pages - 4));
  const numbers = Array.from({ length: Math.min(5, pages) }, (_, index) => first + index);

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
      {onPageSize ? (
        <Form.Group controlId={`${name}-page-size`} className="d-flex align-items-center gap-2">
          <Form.Label className="mb-0 text-nowrap">Rows per page</Form.Label>
          <Form.Select
            size="sm"
            value={pageSize}
            onChange={(event) => onPageSize(Number(event.target.value))}
            style={{ width: 'auto' }}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      ) : (
        <span />
      )}
      <nav aria-label={label}>
        <Pagination className="mb-0">
          <Pagination.Prev disabled={page <= 1} onClick={() => onPage(page - 1)} />
          {numbers.map((number) => (
            <Pagination.Item key={number} active={number === page} onClick={() => onPage(number)}>
              {number}
            </Pagination.Item>
          ))}
          <Pagination.Next disabled={page >= pages} onClick={() => onPage(page + 1)} />
        </Pagination>
      </nav>
    </div>
  );
}
