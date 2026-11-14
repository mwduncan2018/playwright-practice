# alpha-playwright

Playwright end-to-end tests.

## Apps

Each app's tests are in a folder of their own. A run tests one app: set `TEST_APP_FOLDER` to its
folder and `TEST_APP_URL` to its site.

| `TEST_APP_FOLDER`     | `TEST_APP_URL`           |
| --------------------- | ------------------------ |
| `tests/super-catalog` | `http://localhost:3001/` |
| `tests/super-portal`  | `http://localhost:3002/` |

Super Catalog and Super Portal run in the repo's local Docker environment and sign in through its
Keycloak. Start it from the repo root with `docker compose up -d --wait`. Their tests follow the manual
test plans in their folders, such as `tests/super-catalog/super-catalog-test-plan.docx`.

## Environment variables

Every setting is an environment variable. For local runs, copy `.env.example` to `.env` and put in
your values. Git ignores `.env`.

A variable set in the shell overrides `.env`. A pipeline has no `.env`, so it must set these itself.

| Variable               | What it sets                                   | Values                                              | If not set                       |
| ---------------------- | ---------------------------------------------- | --------------------------------------------------- | -------------------------------- |
| `TEST_APP_FOLDER`      | The folder of tests to run                     | A path from this folder, like `tests/super-catalog` | Every test in this project runs  |
| `TEST_APP_URL`         | The app's address, which `page.goto('/')` uses | A full URL, like `http://localhost:3001/`           | `page.goto('/')` doesn't work    |
| `TEST_BROWSER`         | The browser to run in                          | `chromium`, `firefox`, `webkit`, `msedge`, `chrome` | "No tests found"                 |
| `TEST_PARALLEL`        | Whether tests in the same file run at one time | `true` turns it on; anything else is off            | Off                              |
| `TEST_RETRIES`         | How many times a failing test is retried       | A whole number                                      | `0`                              |
| `TEST_WORKERS`         | How many tests run at once                     | A whole number, not a percentage                    | Half the CPU cores               |
| `TEST_TRACE`           | When a test's trace is recorded and kept       | A trace mode, listed in `.env.example`              | `on-first-retry`                 |
| `TEST_HISTORY_KEEP`    | How many local runs `playwright-history` keeps | A whole number                                      | `20`                             |
| `TEST_PASSWORD_<USER>` | A test account's password                      | Its password; `.env.example` has the local ones     | Signing in as that account fails |
| `TEST_ADMIN_USERNAME`  | The admin account's username                   | A username                                          | No effect yet: no test reads it  |
| `TEST_ADMIN_PASSWORD`  | The admin account's password                   | A password                                          | No effect yet: no test reads it  |

- `TEST_APP_FOLDER` and `TEST_APP_URL` go together. If they don't match, one app's tests run against
  the other app's site.
- `TEST_PASSWORD_<USER>` is one variable per test account, named after its username, such as
  `TEST_PASSWORD_ADMIN1` for admin1. Super Catalog and Super Portal's tests use admin1, standard1 and
  standard2.
- `msedge` and `chrome` run the Microsoft Edge and Google Chrome installed on the machine. The other
  three are browsers Playwright downloads, which aren't digitally signed, so Windows Smart App Control
  can block them. Where it's turned on, use `msedge` or `chrome`.
- Keep real passwords in `.env` or in masked pipeline variables, never in `.env.example`.
- A trace records what a test typed, passwords included. In a test that types a password, turn traces
  off with `test.use({ trace: 'off' })`.
- `CI` isn't set by you: most pipelines set it automatically. When it's set, a run that contains
  `test.only` fails.

## Run history

Each local run saves its HTML report in a folder of its own under `playwright-history`, with a
`summary.json` of the results. `playwright-history/index.html` lists the saved runs, newest first.
Each run also deletes the oldest runs beyond `TEST_HISTORY_KEEP`. `npx playwright test --list` only
lists the tests, so it isn't saved.

Each report's title shows the run's `TEST_APP_FOLDER`, `TEST_BROWSER` and `TEST_APP_URL` as they were
set, and the list shows them in its App and Browser columns.

The list uses the same light or dark theme as Playwright's reports: the one picked with the gear icon
in any run's report, or else the system's.

To see the list and open a run's report:

```bash
npm run report:history
```

Open reports this way, not from the files on disk: traces only load when the report is served.

In a GitLab pipeline, where `GITLAB_CI` is `true`, none of this happens. The run writes one HTML report
to `playwright-report` instead.

## Page objects

Every page object extends the base page in `shared/base.page.ts`, which gives it:

- `getCurrentUrl()`: the address the browser is on now. It reads the address once, without waiting, so
  to check where a test ended up, use `await expect(page).toHaveURL(...)`, which waits for it.
- `getTabTitle()`: the browser tab's title now. It reads the title once, without waiting, so to check
  it, use `await expect(page).toHaveTitle(...)`, which waits for it.
- `takeScreenshot(name)`: a full-page screenshot, added to the test's report under that name. It only
  works while a test is running.

Each app's page objects go in a `pages` folder in that app's test folder. For example,
`tests/super-catalog/pages/products.page.ts` is Super Catalog's Products page. Parts that appear on many
pages, such as a menu, a dialog or a wizard, are component classes there that don't extend the base
page.

### What goes in a page object

Page objects hold locators, and tests act on them with Playwright directly, so every click, fill and
check shows up in the test and its report:

```ts
await page.goto(catalog.productForm.path);
await catalog.productForm.name.fill(product.name);
await catalog.productForm.createButton.click();
```

- **Locators are properties**: buttons, fields, headings, and fixed sets of values such as a product's
  `price` or a request's `status`.
- **A page's address is a `path` property**, opened with `page.goto(products.path)`. A page whose
  address ends in a number has the start of it: `page.goto(request.path + requestNumber)`.
- **Methods only for dynamic tables and lists**: rows that come and go, found by a value a test
  creates or loops over, such as `products.row(sku)`, `approvals.approveButton(requestNumber)` or
  `categories.productCount(name)`.
- **No methods for flows**, such as signing in or filling in a form. Those steps go in the test, even
  when they're long.
- **Things that vary per test are found in the test** from a property, such as a radio button,
  `wizard.dialog.getByRole('radio', { name: 'High', exact: true })`, or a message,
  `layout.alerts.filter({ hasText: 'Comment posted.' })`.

The base page's three methods are the team's agreed exception.

Helpers outside page objects are only for tricks and test data: `fillSecret` in `shared/fill-secret.ts`
types a password without it showing in the report, and the `test-data.ts` files make unique names,
SKUs, dates and products.

To check a download, start waiting for it before the click that starts it:

```ts
const downloading = page.waitForEvent('download');
await products.exportCsv.click();
const download = await downloading;
```

## Signing in

Before any test, the `setup` project (`shared/auth.setup.ts`) signs in every account once and saves
each session to `playwright/.auth`. That folder is git-ignored; keep it out of pipeline artifacts too,
since the files hold sign-in cookies. The setup records no traces, and the report shows each sign-in
as a test, so a failed sign-in is easy to spot.

Super Catalog and Super Portal's tests import `test` and `expect` from their app's `fixtures.ts`, and
start from a saved session. Each test chooses whose with `test.use({ signedInAs: ... })`:

| `signedInAs`      | Account   | Use it for                                                 |
| ----------------- | --------- | ---------------------------------------------------------- |
| `'standard'`      | standard1 | The default: shared by many tests at the same time         |
| `'admin'`         | admin1    | Admin tests: also shared                                   |
| `'standard-side'` | standard2 | A test that changes the user's own data, such as Settings  |
| `'nobody'`        | none      | A test that signs in itself, such as the sign-in test      |

Tests on a shared account run at the same time as each other, so they mustn't change anything stored
for the user, such as settings or preferences. They create records with unique names and check only
those, and they never sign out of the shared session. A test that has to change the user's own data
uses a side account and is tagged `@side-account`, which runs it in the `side-accounts` project, one
test at a time.
