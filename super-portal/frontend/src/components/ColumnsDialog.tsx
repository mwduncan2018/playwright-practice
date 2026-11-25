import { useEffect, useId, useState } from 'react';
import { Button, CloseButton, Form, ListGroup, Modal } from 'react-bootstrap';

import { ALWAYS_SHOWN, type ColumnChoice, defaultColumnChoices } from '../columnLayout';
import { testIdPart } from '../testIds';
import { REQUEST_COLUMNS } from './RequestsTable';

type Direction = 'up' | 'down';

interface Props {
  show: boolean;
  /** The columns as the table shows them now. The dialog changes a copy until Save columns. */
  choices: ColumnChoice[];
  onSave(choices: ColumnChoice[]): void;
  onClose(): void;
}

function labelFor(choice: ColumnChoice): string {
  return REQUEST_COLUMNS.find((column) => column.key === choice.key)?.label ?? choice.key;
}

/**
 * Chooses which columns a requests table shows, and their order, with Move up and Move down buttons.
 * Its test ID is "columns-dialog". Each column's parts are named after it, such as
 * "columns-dialog-decided-by-checkbox" and "columns-dialog-decided-by-move-up-button".
 */
export function ColumnsDialog({ show, choices, onSave, onClose }: Props) {
  const titleId = useId();
  const idPrefix = useId();
  const [draft, setDraft] = useState(choices);
  const [moved, setMoved] = useState<{ key: string; direction: Direction } | null>(null);

  // Keep the keyboard on the column that just moved. At the top or bottom its button is disabled,
  // so the other one takes the focus.
  useEffect(() => {
    if (!moved) return;
    const index = draft.findIndex((choice) => choice.key === moved.key);
    const atEnd = moved.direction === 'up' ? index === 0 : index === draft.length - 1;
    const direction = atEnd ? (moved.direction === 'up' ? 'down' : 'up') : moved.direction;
    document.getElementById(`${idPrefix}-${moved.key}-${direction}`)?.focus();
  }, [draft, moved, idPrefix]);

  function move(index: number, direction: Direction) {
    const target = direction === 'up' ? index - 1 : index + 1;
    const next = [...draft];
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(next);
    setMoved({ key: draft[index].key, direction });
  }

  function toggle(key: string, shown: boolean) {
    setDraft(draft.map((choice) => (choice.key === key ? { ...choice, shown } : choice)));
    setMoved(null);
  }

  function reset() {
    setDraft(defaultColumnChoices());
    setMoved(null);
  }

  return (
    <Modal show={show} onHide={onClose} aria-labelledby={titleId} centered data-testid="columns-dialog">
      {/* The X written out, as Modal.Header would render it, so it can carry a test ID. */}
      <Modal.Header>
        <Modal.Title id={titleId} data-testid="columns-dialog-title">
          Choose columns
        </Modal.Title>
        <CloseButton aria-label="Close" onClick={onClose} data-testid="columns-dialog-close-button" />
      </Modal.Header>
      <Modal.Body>
        <p data-testid="columns-dialog-instructions-text">
          Choose the columns to show, and move them into the order you want. Number is always shown.
        </p>
        <ListGroup as="ol" aria-label="Columns" data-testid="columns-dialog-columns-list">
          {draft.map((choice, index) => {
            const label = labelFor(choice);
            const columnTestId = `columns-dialog-${testIdPart(choice.key)}`;
            return (
              <ListGroup.Item
                as="li"
                key={choice.key}
                className="d-flex align-items-center justify-content-between gap-2"
                data-testid={`${columnTestId}-item`}
              >
                <Form.Check
                  id={`${idPrefix}-${choice.key}`}
                  label={label}
                  checked={choice.shown}
                  disabled={choice.key === ALWAYS_SHOWN}
                  onChange={(event) => toggle(choice.key, event.target.checked)}
                  data-testid={`${columnTestId}-checkbox`}
                />
                <div className="d-flex gap-1">
                  <Button
                    id={`${idPrefix}-${choice.key}-up`}
                    size="sm"
                    variant="outline-secondary"
                    aria-label={`Move ${label} up`}
                    title={`Move ${label} up`}
                    disabled={index === 0}
                    onClick={() => move(index, 'up')}
                    data-testid={`${columnTestId}-move-up-button`}
                  >
                    ↑
                  </Button>
                  <Button
                    id={`${idPrefix}-${choice.key}-down`}
                    size="sm"
                    variant="outline-secondary"
                    aria-label={`Move ${label} down`}
                    title={`Move ${label} down`}
                    disabled={index === draft.length - 1}
                    onClick={() => move(index, 'down')}
                    data-testid={`${columnTestId}-move-down-button`}
                  >
                    ↓
                  </Button>
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer className="justify-content-between">
        <Button variant="outline-secondary" onClick={reset} data-testid="columns-dialog-reset-button">
          Reset to default
        </Button>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={onClose} data-testid="columns-dialog-cancel-button">
            Cancel
          </Button>
          <Button onClick={() => onSave(draft)} data-testid="columns-dialog-save-button">
            Save columns
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
