# Super Portal

An example app to automate: an employee request portal with a React front end and a FastAPI back end.
People request equipment, software or access through wizard dialogs, and admins approve or reject
the requests. Everyone signs in through Keycloak; the users and their roles are in the
[root README](../README.md).

## Run it

From the repo root (the first build takes a few minutes):

```bash
docker compose up -d --build --wait
```

Then open http://localhost:3002 and sign in. The sample data is reloaded every time the app starts,
so `docker compose restart super-portal` puts it back as it was.

## Pages

| Page | Address | Who can use it |
| --- | --- | --- |
| Home | `/` | Everyone. Open requests, approvals waiting (admins), recent requests and the latest announcements. |
| New request | `/catalog` | Everyone. Each request type opens its wizard. `/catalog?new=Equipment` (or `Software`, `Access`) opens one directly. |
| My requests | `/requests` | Everyone. Search, and filter by status and type. |
| Request details | `/requests/REQ-1096` | The requester and admins. History, comments, cancel, approve and reject. |
| Approvals | `/approvals` | Admins. Requests waiting for a decision, oldest first, approved or rejected in a dialog. |
| All requests | `/all-requests` | Admins. Everyone's requests, also filtered by priority and requester. Columns chooses the columns and their order. |
| Reports | `/reports` | Admins. Requests by status, type and priority, and the average time to a decision. |
| Announcements | `/announcements` | Everyone. Admins add them with a wizard. |
| Announcement | `/announcements/:id` | Everyone. Admins can delete it. |
| People | `/people` | Everyone. Search, and filter by department. |
| Person | `/people/:username` | Everyone. Admins also see that person's requests. |
| Settings | `/settings` | Everyone. The account, email switches, default priority and rows per page (10, 25, 50 or 100); sign out. |

A standard user who opens an admin page by its address sees "You don't have access to this page",
and the API refuses admin actions with a 403.

## The wizards

Each request type has its own wizard dialog:

| Request | Steps |
| --- | --- |
| Equipment | Equipment (item, quantity) → Delivery (how; an address when shipping) → Priority and reason → Review |
| Software | Software → License (length, seats) → Priority and reason → Review |
| Access | System and access (system, level) → Security review, only for Administrator access → Priority and reason → Review |

How they behave:

- "Step 2 of 4" and a list of the steps show where you are. Choosing Administrator access adds the
  Security review step, so the count changes from 3 to 4.
- Next checks the step and shows what's missing. Changing a field clears its message. Back keeps
  everything you entered.
- Review shows every answer, with an Edit button that goes back to that step.
- Closing (Cancel, the X or Esc) after entering anything asks "Discard this request?", with Keep
  editing and Discard.
- Submit request shows the new request's number, such as REQ-1101, and a View request button.
- Priority starts at the default priority from the user's Settings.

Admins also have a New announcement wizard on the Announcements page: Message → Audience →
Publishing (now, or on a later date at 09:00 UTC, and whether to pin it) → Review.

## The All requests columns

All requests starts with Number, Title, Type, Requester, Priority, Status and Submitted. Columns
opens a Choose columns dialog, where each column has a checkbox that shows it and Move up and Move
down buttons:

- Needed by, Updated and Decided by start hidden. Needed by shows the date, or "—" when there's
  none. Decided by shows the admin who approved or rejected the request, or "—".
- Number is always shown, but it can move.
- Save columns applies the choice, Cancel (or the X or Esc) drops it, and Reset to default puts the
  columns back as they started.
- The choice is saved in the browser for each user, so it lasts across reloads but not into another
  browser. Each new Playwright browser context starts with the default columns.
- My requests, Home and a person's page keep their fixed columns.

## Rules the app enforces

- Quantity is 1 to 10 and seats 1 to 50. Shipping needs an address of at least 10 characters. The
  reason needs at least 10 characters, and a needed-by date can't be in the past.
- Administrator access needs a reason of at least 20 characters and confirmed security training.
- Standard users see only their own requests. Opening someone else's shows "We couldn't find that request."
- Only the requester can cancel a request, and only while it's waiting.
- Admins can't approve or reject their own requests, and their own requests aren't in their
  Approvals list.
- Rejecting needs a reason of at least 5 characters, which the requester sees. An approval note is
  optional.
- Announcements for admins only are hidden from standard users. A scheduled announcement is visible
  only to admins until its date.

## Test IDs

Every element a test acts on or checks has a `data-testid`, so `page.getByTestId()` finds it:

- buttons, links, menu items, fields, checkboxes, radios, switches and paging controls
- dialogs, alerts, toasts, tables, rows, cells, badges, cards, headings and lists
- the text and values a test reads

Super Catalog is different. It has no test IDs on its controls, so its tests find them by role and
label. Only its displayed values, stat cards and product rows have test IDs.

How the IDs are named:

- Lowercase words joined by hyphens. Each ID ends in the kind of element, for example `-button`,
  `-link`, `-input`, `-textarea`, `-select`, `-checkbox`, `-radio`, `-switch`, `-dialog`,
  `-alert`, `-badge`, `-heading`, `-table`, `-header`, `-row`, `-cell`, `-list`, `-item`,
  `-card`, `-form`, `-text` or `-value`. Test IDs from before this convention keep their names,
  such as `request-status`, `report-total` and `new-request-number`.
- Each ID is unique on its page. The parts of a dialog or wizard start with its ID, for example:
  - `approve-dialog-submit-button`
  - `cancel-request-dialog-confirm-button`
  - `equipment-wizard-next-button`
  - `access-wizard-security-step-item`
- A repeated row or list item has an ID that ends in its key, for example `request-row-REQ-1096`,
  `person-row-standard1`, `announcement-item-3` or `count-row-submitted`. The elements inside
  share IDs, so a test finds the row first:
  `page.getByTestId('request-row-REQ-1096').getByTestId('status-cell')`. The history entries on a
  request's page are all `history-item`, oldest first.
- A table's column headers are its ID, the column and `-header`, such as
  `all-requests-table-status-header`. Its cells are the column and `-cell`, such as `status-cell`.
- A field's error message is its ID and `-error`, and its help text is its ID and `-help`, for
  example `wizard-quantity-error`. A radio is its group's name, the choice and `-radio`, such as
  `level-administrator-radio`, inside `level-radio-group`.

Where they come from in the code:

- `testIdPart()` in `frontend/src/testIds.ts` turns a label or key into part of an ID. For example,
  "Needed by" becomes `needed-by`.
- `WizardDialog`, `ConfirmDialog`, `RequestsTable` and `AnnouncementList` take a `testId` and
  build their parts' IDs from it. `Field`, `RadioGroup`, `ReviewSection`, `ColumnsDialog` and
  `TablePagination` build theirs from the field's ID, the group's name, the section's title or the
  table's name.
- React Bootstrap puts some test IDs somewhere other than the element:
  - The X on dialogs and toasts is a separate `CloseButton`, because the built-in X can't carry a
    test ID.
  - The user menu is a `Dropdown` with a `Nav.Link` toggle, because `NavDropdown` puts the ID on
    its wrapper rather than the toggle.
  - A dialog's ID lands on its `.modal-dialog` element, which holds the title, body and buttons.
  - On a `Form.Check` the ID lands on the input. A breadcrumb link gets its ID through `linkProps`.

## Sample data

- 100 requests from the past year, REQ-1001 to REQ-1100: 73 approved, 11 rejected, 10 cancelled
  and 6 waiting (REQ-1095 to REQ-1100). REQ-1097 is admin3's own request.
- REQ-1001 to REQ-1080 are older, decided or cancelled requests made from templates in
  `backend/app/seed.py`, 10 for each user. REQ-1081 to REQ-1100 are the recent ones.
- standard1 has 16 requests, 2 of them waiting. REQ-1084, REQ-1096 and REQ-1098 have comments.
- 6 announcements: 2 pinned, 1 for admins only and 1 for standard users only.
- The people directory lists the 8 users with their departments and job titles.
- Everyone starts with the default settings: decision and comment emails on, weekly summary off,
  Normal priority and 10 rows per page.

## How it's built

The same way as [Super Catalog](../super-catalog/README.md): `frontend/` is React 19, React
Bootstrap 2, React Router and keycloak-js, built with Vite; `backend/` is FastAPI with SQLModel on
SQLite, and PyJWT checks the Keycloak token on every API call. One container serves both on port
3002, and the API's interactive documentation is at http://localhost:3002/docs. Its look is
Bootstrap's dark mode in a dark blue theme, set in `frontend/src/theme.css` the same way as Super
Catalog's brown one.

It reads the same environment variables as Super Catalog, with `KEYCLOAK_CLIENT_ID` set to
`super-portal` and the database at `/app/data/super-portal.db`. After changing the app's code,
rebuild it with `docker compose up -d --build super-portal`.
