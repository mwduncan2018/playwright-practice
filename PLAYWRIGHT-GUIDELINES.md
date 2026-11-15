# Playwright test automation guidelines

How Playwright test automation is written in this repo: the test plans, the tests, the page objects and how the work is done.

## Test plans

- Every automated test automates a case from the app's manual test plan. Never write a test with no case in the plan. When a new test is needed, write its case into the plan first, then automate it.
- Plans are Markdown files in the app's test folder (`tests/<app>/<app>-test-plan.md`), so GitHub shows them.
- When a plan changes, bump its version and date, and bump the version in `testPlan('<plan name>', '<version>')` in the app's `fixtures.ts`.
- In a plan, escape placeholders such as `<number>` as `\<number>`, or GitHub hides them.
- **Test name:** the case's ID and title. Tag it `@smoke` or `@regression` to match the plan, and annotate it with `plan('<ID>')`.
- **Step titles:** each `test.step` title is the step's number and its action, word for word: `'2. Select Next without choosing anything.'`
- **Check messages:** each check's message is the step's expected result, word for word.
- **Smoke and regression:** smoke cases are the short check that runs in every environment, staging included. Regression cases run in dev, test and locally. Picking which ones run is the pipeline's job (`--grep @smoke`), not the framework's.

## Spec files

- Every statement goes on one line, however long, including the `test(...)` declaration. Only callback bodies span lines.

  ```ts
  test('SP-006 An admin approves a request', { tag: '@smoke', annotation: plan('SP-006') }, async ({ standardUser, adminUser }) => {
  ```

- Every line names the user first: `<user>.<pageObject>.<locator>.<playwrightMethod>`, as in `await adminUser.productFormPage.createButton.click();`. Never use a shortcut such as `const wizard = standardUser.equipmentWizard`.
- **No location strategies in tests:** no `getByRole`, `getByLabel`, `getByText`, `locator`, `filter`, `first()` or `last()`. A test only names locators from page objects.
- **Act on locators with Playwright directly** (`click`, `fill`, `check`, `selectOption`, `setInputFiles`), so every action shows in the test and its report.
- **Flows are written out in the test**, such as signing in or filling in a form, even when they're long.
- **Open pages by their `path`:** `await adminUser.page.goto(adminUser.productsPage.path)`. For an address that ends in an ID, add the ID: `standardUser.requestPage.path + requestNumber`.
- **Values for later steps:** a value a later step needs, such as a new request's number, is returned from its `test.step`. Check that the page shows it before reading it, because a read waits for the element, not for its text:

  <!-- prettier-ignore -->
  ```ts
  await expect(standardUser.equipmentWizard.newRequestNumberText, "The wizard shows the new request's number.").toHaveText(/^REQ-\d{4,}$/);
  return (await standardUser.equipmentWizard.newRequestNumberText.innerText()).trim();
  ```

- **No comments** in specs, page objects, fixtures or helpers. Explanations go in the README.
- **Downloads:** to check one, start waiting before the click:

  ```ts
  const downloadPromise = standardUser.page.waitForEvent('download');
  await standardUser.productsPage.exportCsvButton.click();
  const csvDownload = await downloadPromise;
  ```

## Assertions

- **Use Playwright's checks on locators** (`toHaveText`, `toContainText`, `toHaveCount`, `toBeVisible`, `toBeChecked`, `toHaveValue`) and rely on their retrying. Keep Playwright's shape: `await expect(locator, message).toHaveText(...)`.
- **Messages go inside `expect(`** as written text, never in a variable:

  ```ts
  await expect(adminUser.requestPage.statusValue, 'The status is Approved.').toHaveText('Approved');
  ```

  When several checks share one expected result, each repeats the text.

- **Don't read a value from the page to check it,** as in `expect(await locator.innerText()).toBe(...)`. Read a value only to pass it to a later step.
- **Plain checks are only for things that aren't on the page,** such as a downloaded file's name or lines. A finished file has nothing to wait for, so a non-retrying matcher such as `toBe` is right, and the check has no `await`:

  ```ts
  expect(csvDownload.suggestedFilename(), '...').toBe(`products-${todaysDate}.csv`);
  ```

- **Page objects never return true or false.**
- **Where the browser is, and the tab title:** check them with `expect(page).toHaveURL(...)` and `toHaveTitle(...)`. The base page's `getCurrentUrl()` and `getTabTitle()` read once, without waiting.
- **Text that includes the test's own data is checked, not searched for.** A message about what the test just did is the newest one:

  ```ts
  await expect(adminUser.alertsPage.newestAlertMessage, '...').toContainText(`Approved ${requestNumber}.`);
  ```

  Rows found by the test's data come from a lookup method, and `toContainText([...])` checks that one of them has the text.

- **Never branch on what the page shows.** The test set up its data, so it knows what to expect. Check the value the result depends on, then the result.
- **Before checking that something isn't there** (`toHaveCount(0)`), check that something which should be there is visible. Otherwise the check can pass on a page that hasn't loaded.

## Page objects

- **Every page object class extends the base page** (`shared/base.page.ts`), pages and components alike: navbar, alerts, wizards, dialogs.
- **The base page stays small:** `getCurrentUrl()`, `getTabTitle()` and `takeScreenshot(name)`. No wrappers around click, fill or waiting.
- **One class per file**, named after the class and ending in what it is: `home.page.ts`, `announcement.wizard.ts`, `confirm.dialog.ts`.
- **Where they live:** page objects go in `tests/<app>/pages`. Each app's `fixtures.ts` puts every page and component on each user.
- **Shared parts are their own components,** such as `NavbarPage` for the menu and `AlertsPage` for messages, not an abstract layout base class.
- **Locators are `readonly` properties** set in the constructor. Every location strategy lives in page objects.
- **Everything that's the same on every run gets its own property,** whole sets included: each radio button (`lowPriorityRadio` to `urgentPriorityRadio`), each review section, each fixed message (`settingsSavedAlert`), each column checkbox and move button.
- **A page's address is a `path` property.**
- **Methods are only for dynamic tables and lists:** rows found by a value the test creates or loops over, such as `productRow(sku)` or `approveButton(requestNumber)`. They return a `Locator`.
- **Lookup methods never read the page:** they build a locator and return it, so they're never `async`. A method that read the page first, such as a column's position from its headings, would fix what it read into the locator, and retrying couldn't correct it.
- **No methods for flows.**
- **No checks in page objects:** a page object never calls `expect(`. It gives the test the locator to check, as a property or from a lookup method, and the test checks it.
- **No nested page objects:** a page object never holds another page object. Wizards and dialogs sit beside pages on each user, as in `adminUser.rejectDialog.confirmButton`.
- **Dialogs with a name or number in their title:** only one dialog is open at a time, so such a dialog's locator matches whichever is open.
- **Scope each locator to its container:** radios inside their named group, controls inside their dialog or form. Check the app's source for the real structure.
- **Tables whose columns can be hidden or reordered:**
  - Find a cell by its column's heading, not its position: `allRequestsPage.statusCell(requestNumber, requesterName)`.
  - Match a row by values that are each in their own column.

## Naming

- **Every name says what it is:**
  - Users end in `User`: `standardUser`, `adminUser`, `standardSideUser`, `signedOutUser`.
  - Page objects end in `Page`, wizards in `Wizard`, dialogs in `Dialog`.
  - Test variables say what they hold: `testProduct`, `rejectionReason`, `deliveryAddress`, `requestNumber`.
  - Never short names like `wizard`, `dialog`, `name` or `note`.
- **Locators end in what they find:**

  | It finds                                  | Name ends in                                  |
  | ----------------------------------------- | --------------------------------------------- |
  | an input, textarea or select              | `Input`, `Textarea`, `Select`                 |
  | a checkbox or radio button                | `Checkbox`, `Radio`                           |
  | a button or link                          | `Button`, `Link`                              |
  | a heading, table, list, region or image   | `Heading`, `Table`, `List`, `Region`, `Image` |
  | rows, list items, column headings, a cell | `Row(s)`, `ListItems`, `Headers`, `Cell`      |
  | the value beside a label, a line of text  | `Value`, `Text`                               |
  | a badge, an alert, a dashboard number     | `Badge`, `Alert`, `CardNumber`                |

  Name a plain `div` or `span` by what it is to the person using the app, never `Div`. Lookup methods are named the same way: `productRow(sku)`, `statusCell(...)`.

## Users, sign-in and passwords

- **Tests ask for users by name,** as fixtures. Each user has their own browser, started from a saved session, with every page object on it, plus `page`, `account` and `keycloakPage`.
- **Sign in once,** in the setup project, and reuse the saved sessions. `playwright/.auth` is git-ignored and kept out of pipeline artifacts.
- **Shared accounts** (`standardUser`, `adminUser`) run in many tests at once. Those tests never change the user's stored data, such as settings, and never sign out.
- **A test that changes the user's own data** uses `standardSideUser` and is tagged `@side-account`, which runs it on its own.
- **Passwords live only in environment variables** (`TEST_PASSWORD_<USERNAME>`: `.env` locally, masked variables in a pipeline). Never in repo files, reports or traces.
  - Type passwords with `fillSecret`.
  - Turn traces off in a test that types a password: `test.use({ trace: 'off' })`.
- **Failures:** screenshots are taken on failure, where password fields show as dots. Playwright's text copy of the page is turned off (`PLAYWRIGHT_NO_COPY_PROMPT`), because it shows what's in every field, passwords included.

## Test data and parallel runs

- Tests run side by side in one environment. Each test creates its own records with unique values, using the `test-data.ts` helpers, and checks only those.
- Rely on sample data only where no test changes it. Never check totals that other tests change.
- Find a test's row by searching or filtering for its unique value, not by paging or position.

## Configuration

- **Every setting is an environment variable,** kept in `.env` locally. A pipeline sets its own.
- **One app per run:** `TEST_APP_FOLDER` and `TEST_APP_URL` go together.
- **No named environments** (no `TEST_ENV`): set each app's URL.
- **Sharding:** keep runs ready to split across machines with Playwright's own `--shard` and blob reports.

## Formatting

- Prettier with single quotes.
- Page objects, shared code and the README use a print width of 120.
- Specs use `--print-width 1000 --object-wrap collapse`, so each statement stays on one line. Never re-wrap specs at 120.

## Working on this project

- **"Discuss":** answer with options and a recommendation, then wait. Change no files until there's a go-ahead.
- **Which framework:** "Playwright" means `alpha-playwright`. Touch `beta-playwright` or `zed-playwright` only when they're named.
- **Git:** branch off `master` before committing. Commit, merge, push and delete the branch only when asked. No pull requests.
- **`.env`:** don't edit it. The user keeps it.
- **Example apps:** no deliberate gaps or planted bugs.
