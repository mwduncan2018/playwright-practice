# Super Catalog

An example app to automate: a product catalog with a React front end and a FastAPI back end.
Everyone signs in through Keycloak; the users and their roles are in the [root README](../README.md).

## Run it

From the repo root (the first build takes a few minutes):

```bash
docker compose up -d --build --wait
```

Then open http://localhost:3001 and sign in. The sample data is reloaded every time the app starts,
so `docker compose restart super-catalog` puts it back as it was.

## Pages

| Page | Address | Who can use it |
| --- | --- | --- |
| Dashboard | `/` | Everyone |
| Products | `/products` | Everyone. Search, filters, sorting, paging and CSV export. Filters are kept in the address. |
| Product details | `/products/:id` | Everyone. Admins can edit and delete. |
| New product | `/products/new` | Admins |
| Edit product | `/products/:id/edit` | Admins. Also adds, replaces or removes the product's image. |
| Categories | `/categories` | Everyone. Admins add, edit and delete categories in dialogs. |
| Suppliers | `/suppliers` | Everyone. Search and filter by country. |
| Supplier details | `/suppliers/:id` | Everyone. Admins can edit and delete. |
| New supplier, edit supplier | `/suppliers/new`, `/suppliers/:id/edit` | Admins |
| Activity log | `/activity` | Admins. Filter by user, action, type and date. |
| My account | `/account` | Everyone. Shows the signed-in user's roles and signs out. |

A standard user who opens an admin page by its address sees "You don't have access to this page",
and the API refuses admin changes with a 403.

## Sample data

- 60 products, 10 in each of 6 categories. SKUs start with the category: `ELE-1001` to `ELE-1010`
  for Electronics, then `HOM`, `OFF`, `OUT`, `SPO` and `TOY`.
- 53 products are Active, 4 Draft and 3 Discontinued.
- Every product's reorder level is 10, and 14 products are at or below it (low stock).
- 8 suppliers in 7 countries.
- The activity log starts with 82 entries: everything being created, then 8 recent changes by
  admin1, admin2 and admin3.

## Rules the app enforces

- SKU: three capital letters, a dash and four digits, such as `ELE-1234`. No two products can share one.
- Name and category are required. Price must be more than 0 and at most 100,000. Stock and reorder
  level are whole numbers, 0 or more.
- Category names and supplier names must be unique, ignoring case.
- A category or supplier that still has products can't be deleted.
- Images must be PNG or JPEG, up to 1 MB.
- Times are shown in UTC, and the activity log's dates are UTC dates.

## How it's built

- `frontend/`: React 19, React Bootstrap 2, React Router and keycloak-js, built with Vite.
- The look: Bootstrap's dark mode in a dark brown theme with a copper accent, set in
  `frontend/src/theme.css`. Its text colors have at least 4.5:1 contrast with their backgrounds,
  and buttons and field borders at least 3:1 (WCAG AA).
- `backend/`: FastAPI, SQLModel on SQLite, and PyJWT, which checks the Keycloak token on every
  API call.
- One container serves both: the API under `/api`, and the React app for every other path. The
  API's interactive documentation is at http://localhost:3001/docs.

The container reads its settings from environment variables, so the same image works in any
environment:

| Variable | What it sets | In the local environment |
| --- | --- | --- |
| `KEYCLOAK_URL` | Keycloak's address for browsers, and the token issuer | `http://localhost:8080` |
| `KEYCLOAK_INTERNAL_URL` | Keycloak's address for the back end, to fetch signing keys | `http://keycloak:8080` |
| `KEYCLOAK_REALM` | The realm | `super-apps` |
| `KEYCLOAK_CLIENT_ID` | This app's client in that realm | `super-catalog` |
| `DATABASE_PATH` | The SQLite file | `/app/data/super-catalog.db` |
| `KEEP_DATA` | `true` keeps existing data at startup instead of reloading the sample data | not set |

After changing the app's code, rebuild it with `docker compose up -d --build super-catalog`.
