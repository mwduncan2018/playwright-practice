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
| Request details | `/requests/REQ-1016` | The requester and admins. History, comments, cancel, approve and reject. |
| Approvals | `/approvals` | Admins. Requests waiting for a decision, oldest first, approved or rejected in a dialog. |
| All requests | `/all-requests` | Admins. Everyone's requests, also filtered by priority and requester. |
| Reports | `/reports` | Admins. Requests by status, type and priority, and the average time to a decision. |
| Announcements | `/announcements` | Everyone. Admins add them with a wizard. |
| Announcement | `/announcements/:id` | Everyone. Admins can delete it. |
| People | `/people` | Everyone. Search, and filter by department. |
| Person | `/people/:username` | Everyone. Admins also see that person's requests. |
| Settings | `/settings` | Everyone. The account, email switches, default priority and rows per page; sign out. |

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
- Submit request shows the new request's number, such as REQ-1021, and a View request button.
- Priority starts at the default priority from the user's Settings.

Admins also have a New announcement wizard on the Announcements page: Message → Audience →
Publishing (now, or on a later date at 09:00 UTC, and whether to pin it) → Review.

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

## Sample data

- 20 requests, REQ-1001 to REQ-1020: 9 approved, 3 rejected, 2 cancelled and 6 waiting
  (REQ-1015 to REQ-1020). REQ-1017 is admin3's own request.
- standard1 has 6 requests, 2 of them waiting. REQ-1004, REQ-1016 and REQ-1018 have comments.
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
