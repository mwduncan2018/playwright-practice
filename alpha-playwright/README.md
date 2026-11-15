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
- A failing test gets a screenshot of each user's page. Password fields show as dots.
- A failing test's error context (`error-context.md`, and Error Context in the report) has the error
  and the test's code, but no text copy of the page. Playwright's copy shows what's in each field,
  passwords included, so `playwright.config.ts` turns it off with `PLAYWRIGHT_NO_COPY_PROMPT`.
  Playwright doesn't document that variable, so after upgrading Playwright, check it still works: make
  a test type a password and then fail, and search its `test-results` folder for the password.
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
  to check where a test ended up, use `await expect(admin.page).toHaveURL(...)`, which waits for it.
- `getTabTitle()`: the browser tab's title now. It reads the title once, without waiting, so to check
  it, use `await expect(admin.page).toHaveTitle(...)`, which waits for it.
- `takeScreenshot(name)`: a full-page screenshot, added to the test's report under that name. It only
  works while a test is running.

Each app's page objects go in a `pages` folder in that app's test folder. For example,
`tests/super-catalog/pages/products.page.ts` is Super Catalog's Products page. Parts that appear on many
pages, such as a menu, a dialog or a wizard, are component classes there that don't extend the base
page. Each app's `fixtures.ts` lists every page and component a user has.

### What goes in a page object

Page objects hold locators, and tests act on them with Playwright directly, so every click, fill and
check shows up in the test and its report. Each line names the user first:
`<user>.<pageObject>.<locator>.<playwrightMethod>`.

```ts
await admin.page.goto(admin.productForm.path);
await admin.productForm.name.fill(product.name);
await admin.productForm.createButton.click();
```

- **Locators are properties**: buttons, fields, headings, and fixed sets of values such as a product's
  `price` or a request's `status`.
- **A page's address is a `path` property**, opened with `admin.page.goto(admin.products.path)`. A page
  whose address ends in a number has the start of it:
  `standard.page.goto(standard.request.path + requestNumber)`.
- **Methods only for dynamic tables and lists**: rows that come and go, found by a value a test
  creates or loops over, such as `admin.products.row(sku)`, `admin.approvals.approveButton(requestNumber)`
  or `admin.categories.productCount(name)`.
- **No methods for flows**, such as signing in or filling in a form. Those steps go in the test, even
  when they're long.
- **No nested page objects**: a page object holds locators, never another page object or component.
  Wizards and dialogs sit beside the pages on each user, named for what they're for:
  `admin.announcementWizard.title`, `admin.rejectDialog.confirmButton` or
  `admin.deleteProductDialog.confirmButton`. Only one dialog is open at a time, so a dialog titled
  with a name or number, such as "Edit Electronics" or "Reject REQ-1016", matches whichever is open:
  `admin.editCategoryDialog`.
- **One class per file**: every page object, dialog, wizard or other component has a file of its own,
  named after it, such as `announcement.page.ts`, `announcements.page.ts`, `confirm-dialog.ts` or
  `decision-dialog.ts`.
- **Things that vary per test are found in the test** from a property, such as a radio button,
  `standard.equipmentWizard.dialog.getByRole('radio', { name: 'High', exact: true })`, or a message,
  `standard.layout.alerts.filter({ hasText: 'Comment posted.' })`.
- **The user is written out every time**: `standard.equipmentWizard.item`, not a shortcut such as
  `const wizard = standard.equipmentWizard`, so every line says whose browser it acts in.
- **Assertions keep Playwright's shape**: `await expect(admin.request.status).toHaveText('Rejected')`.

The base page's three methods are the team's agreed exception.

Helpers outside page objects are only for tricks and test data: `fillSecret` in `shared/fill-secret.ts`
types a password without it showing in the report, and the `test-data.ts` files make unique names,
SKUs, dates and products.

To check a download, start waiting for it before the click that starts it:

```ts
const downloading = standard.page.waitForEvent('download');
await standard.products.exportCsv.click();
const download = await downloading;
```

## Signing in

Before any test, the `setup` project (`shared/auth.setup.ts`) signs in every account once and saves
each session to `playwright/.auth`. That folder is git-ignored; keep it out of pipeline artifacts too,
since the files hold sign-in cookies. The setup records no traces, and the report shows each sign-in
as a test, so a failed sign-in is easy to spot.

Super Catalog and Super Portal's tests import `test` and `expect` from their app's `fixtures.ts`. A
test asks for the users it needs by name, the same way it asks for any fixture:

```ts
test('SP-006 An admin approves a request', { tag: '@smoke' }, async ({ standard, admin }) => {
```

Each user has a browser of their own, started from their saved session, with every page object for
the app on it. Each also has their `page`, their `account` (such as `admin.account.name`) and
`keycloak`, Keycloak's sign-in page. Playwright only opens browsers for the users a test asks for, and
the trace shows every user's page.

| User           | Account   | Use it for                                                                        |
| -------------- | --------- | --------------------------------------------------------------------------------- |
| `standard`     | standard1 | Most tests: shared by many tests at the same time                                 |
| `admin`        | admin1    | Admin tests: also shared                                                          |
| `standardSide` | standard2 | A test that changes the user's own data, such as Settings. Tag it `@side-account` |
| `signedOut`    | none      | A test that signs in itself, such as the sign-in test                             |

Tests on a shared account run at the same time as each other, so they mustn't change anything stored
for the user, such as settings or preferences. They create records with unique names and check only
those, and they never sign out of the shared session. A test that has to change the user's own data
uses `standardSide` and is tagged `@side-account`, which runs it in the `side-accounts` project, one
test at a time. A test that uses `standardSide` without the tag fails straight away, before it opens
a browser.
