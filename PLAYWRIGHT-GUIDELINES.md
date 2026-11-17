# Playwright test automation guidelines

How Playwright test automation is written in this repo: the test plans, the tests, the page objects and how the work is done. The tests are Gherkin scenarios, run with [playwright-bdd](https://vitalets.github.io/playwright-bdd/) on Playwright's own test runner. A rule that comes from Playwright's or playwright-bdd's documentation links to it; the rest are this repo's choices.

## Test plans

- Every automated test automates a case from the app's manual test plan. Never write a test with no case in the plan. When a new test is needed, write its case into the plan first, then automate it.
- Plans are Markdown files in the app's test folder (`tests/<app>/<app>-test-plan.md`), so GitHub shows them.
- When a plan changes, bump its version and date, and bump the version in `testPlan('<plan name>', '<version>')` in the app's `fixtures.ts`.
- In a plan, escape placeholders such as `<number>` as `\<number>`, or GitHub hides them.
- **Scenario name:** the case's ID and title. Tag it `@smoke` or `@regression` to match the plan, and with the case's ID, such as `@SP-006`, which adds an annotation with the plan's name, its version and the case's ID.
- **Steps:** each action is a When line and each expected result a Then or And line, in the plan's order. Each line names the user, and a Then line starts with "the … user sees that":

  ```gherkin
  When the standard user selects Next without choosing anything
  Then the standard user sees that Item says "Choose an item."
  ```

- **Two-part actions:** an action in two parts with a result to check between them, such as "Select Submit request, then select View request.", is two When lines.
- **The same words about different requests:** where several cases say "Submit the request in the test data", each line names its request: `When the standard user submits the keyboard request in the test data`.
- **Check messages:** each check's message is the step's expected result, word for word.
- **Smoke and regression:** smoke cases are the short check that runs in every environment, staging included. Regression cases run in dev, test and locally. Picking which ones run is the pipeline's job (`--grep @smoke`), not the framework's. See Playwright's [Tag tests](https://playwright.dev/docs/test-annotations#tag-tests).

## Features and step definitions

- **Features** go in `tests/<app>/features`, one for each area of the app, with a scenario for each case. **Step definitions** go in `tests/<app>/steps`, one file per feature, such as `approvals.steps.ts`. A step that several features use lives with the first one.
- **Playwright style:** steps are `When(...)` and `Then(...)` from the app's `fixtures.ts`, made with `createBdd(test)`, and they get fixtures as their first argument, as in playwright-bdd's [Playwright-style steps](https://vitalets.github.io/playwright-bdd/#/writing-steps/playwright-style). No decorators, and no steps in page objects.
- Every statement goes on one line, however long, including the `When(...)` or `Then(...)` declaration. Only callback bodies span lines.

  <!-- prettier-ignore -->
  ```ts
  When('the admin user selects Approve for the request, enters the note, and selects Approve', async ({ adminUser, scenarioContext }) => {
  ```

- **A step asks only for the user its text names.** Playwright opens a browser for every user a step asks for, so a Then step that asked for another user would check that user's empty page.
- Every line names the user first: `<user>.<pageObject>.<locator>.<playwrightMethod>`, as in `await adminUser.productFormPage.createButton.click();`. Never use a shortcut such as `const wizard = standardUser.equipmentWizard`.
- **No location strategies in steps:** no `getByRole`, `getByLabel`, `getByText`, `locator`, `filter`, `first()` or `last()`. A step only names locators from page objects.
- **Act on locators with Playwright directly** (`click`, `fill`, `check`, `selectOption`, `setInputFiles`), so every action shows in the step and its report.
- **Flows are written out in the step**, such as signing in or filling in a form, even when they're long.
- **Open pages from the navbar,** the way a person moves around the app: `await adminUser.navbarPage.productsLink.click()`. A page the navbar doesn't link to is opened from the page that does, such as the New product form from Products, or a request's page from its number on My requests or Approvals. `page.goto` is only for a plan step that goes to an address, such as "Go to the address /products/new.", and for the signed-out user's first visit.
- **Close what's still open before using the navbar.** A dialog such as a submitted request wizard blocks the rest of the page, so the plan closes it first, as in "submit the request in the test data, then select Done".
- **Fixed text first:** a step's text is the plan's. A parameter such as `{string}` or `{word}` comes in only when two scenarios need the same step with different values, and no other step's text would match it too.
- **Escape brackets and slashes** in a step definition's text, because Cucumber expressions use `(` and `)` for optional text and `/` for alternatives. The feature's `the next-page arrow (›)` is `'… the next-page arrow \\(›\\)'` in the step definition.
- **Test data:** values that are the same on every run, such as an address or a reason, are constants at the top of the step file. Data made fresh for each run is a fixture, such as `testProduct` or `testAnnouncement`, so every step in a scenario gets the same one.
- **Values for later steps** go in the `scenarioContext` fixture, which starts empty in each scenario. Check that the page shows a value before reading it, because a read waits for the element, not for its text:

  <!-- prettier-ignore -->
  ```ts
  await expect(standardUser.requestWizard.newRequestNumberText, "The wizard shows the new request's number.").toHaveText(/^REQ-\d{4,}$/);
  scenarioContext.requestNumber = (await standardUser.requestWizard.newRequestNumberText.innerText()).trim();
  ```

- **No comments** in features, step files, page objects, fixtures or helpers. Explanations go in the README.
- **Downloads:** to check one, start waiting before the click, as Playwright's [Downloads](https://playwright.dev/docs/downloads) page shows, and keep the download in `scenarioContext` for the Then steps:

  ```ts
  const downloadPromise = standardUser.page.waitForEvent('download');
  await standardUser.productsPage.exportCsvButton.click();
  scenarioContext.csvDownload = await downloadPromise;
  ```

- **Generate, then run:** `npm test` runs `bddgen`, which writes a `*.feature.spec.js` beside each feature, then `playwright test`. The generated files are git-ignored and never edited, and `bddgen` deletes every `.spec.js` file in the app's folder before writing them.

## Assertions

Checks follow Playwright's advice to [use web-first assertions](https://playwright.dev/docs/best-practices#use-web-first-assertions). Its [auto-retrying assertions](https://playwright.dev/docs/test-assertions#auto-retrying-assertions), such as `toHaveText` and `toBeVisible`, keep checking until the page matches or their timeout runs out (5 seconds by default), so a slow page isn't a failure. When one does fail, it shows what it expected, what it found and the locator it used. A value read from the page is read once, sometimes before the page has caught up, so checking it can make a test flaky.

- **Use Playwright's checks on locators** (`toHaveText`, `toContainText`, `toHaveCount`, `toBeVisible`, `toBeChecked`, `toHaveValue`) and rely on their retrying. Keep Playwright's shape, `await expect(locator, message).toHaveText(...)`, with the `await` in front of `expect(`, not inside it.
- **Messages go inside `expect(`** as written text, never in a variable:

  ```ts
  await expect(adminUser.requestPage.statusValue, 'The status is Approved.').toHaveText('Approved');
  ```

  When several checks share one expected result, each repeats the text. A step with a parameter is the one exception: its message uses the parameter, as in `` `The status is ${requestStatus}.` ``.

- **Don't read a value from the page to check it,** as in `expect(await locator.innerText()).toBe(...)`. Playwright's [Don't use manual assertions](https://playwright.dev/docs/best-practices#dont-use-manual-assertions) gives the same example with `isVisible()`, which returns straight away without waiting. Read a value only to pass it to a later step, or inside `expect.poll`. Each read has a check to use instead, and the [Locator API](https://playwright.dev/docs/api/class-locator#locator-text-content) points `textContent()`, `count()` and `allTextContents()` to the same ones:

  | Instead of reading…                                 | Check with…                            |
  | --------------------------------------------------- | -------------------------------------- |
  | `isVisible()`                                       | `toBeVisible()` / `toBeHidden()`       |
  | `textContent()`, `innerText()`, `allTextContents()` | `toHaveText()` / `toContainText()`     |
  | `inputValue()`                                      | `toHaveValue()`                        |
  | `isChecked()`                                       | `toBeChecked()`                        |
  | `isEnabled()` / `isDisabled()`                      | `toBeEnabled()` / `toBeDisabled()`     |
  | `getAttribute()`                                    | `toHaveAttribute()`                    |
  | `count()`                                           | `toHaveCount()`                        |
  | `page.url()`, `getCurrentUrl()`                     | `expect(adminUser.page).toHaveURL()`   |
  | `page.title()`, `getTabTitle()`                     | `expect(adminUser.page).toHaveTitle()` |

- **Plain checks are only for things that aren't on the page,** such as a downloaded file's name or lines. A finished file has nothing to wait for, so one of Playwright's [non-retrying assertions](https://playwright.dev/docs/test-assertions#non-retrying-assertions), such as `toBe`, is right, and the check has no `await`:

  ```ts
  expect(scenarioContext.csvDownload.suggestedFilename(), '...').toBe(`products-${todaysDate}.csv`);
  ```

- **When no matcher can make the comparison,** such as more than or in order, read the value inside [`expect.poll`](https://playwright.dev/docs/test-assertions#expectpoll), so the read is retried:

  <!-- prettier-ignore -->
  ```ts
  await expect.poll(async () => Number(await adminUser.dashboardPage.productsCardNumber.innerText()), 'The Products count is more than 60.').toBeGreaterThan(60);
  ```

  For several steps that must pass together, use [`expect(...).toPass()`](https://playwright.dev/docs/test-assertions#expecttopass). By default it has no timeout and doesn't use the assertion timeout, so give it a `timeout` of its own.

- **Page objects never return true or false.**
- **Where the browser is, and the tab title:** check them with `expect(page).toHaveURL(...)` and `toHaveTitle(...)`. The base page's `getCurrentUrl()` and `getTabTitle()` read once, without waiting.
- **Text that includes the test's own data is checked, not searched for.** A message about what the test just did is the newest one:

  <!-- prettier-ignore -->
  ```ts
  await expect(adminUser.alertsPage.newestAlertMessage, '...').toContainText(`Approved ${scenarioContext.requestNumber}.`);
  ```

  Rows found by the test's data come from a lookup method, and `toContainText([...])` checks that one of them has the text.

- **Never branch on what the page shows.** The test set up its data, so it knows what to expect. Check the value the result depends on, then the result.
- **Before checking that something isn't there** (`toHaveCount(0)`), check that something which should be there is visible. Otherwise the check can pass on a page that hasn't loaded.

## Page objects

- **Every page object class extends the base page** (`shared/base.page.ts`), pages and components alike: navbar, alerts, wizards, dialogs.
- **The base page stays small:** `getCurrentUrl()`, `getTabTitle()`, `takeScreenshot(name)` and `fillSecret(secretInput, secret)`. `fillSecret` is its one wrapper around fill, because it keeps a password out of the report, which Playwright's `fill` doesn't. No other wrappers around click, fill or waiting.
- **One class per file**, named after the class and ending in what it is: `home.page.ts`, `announcement.wizard.ts`, `confirm.dialog.ts`.
- **Where they live:** page objects go in `tests/<app>/pages`. Each app's `fixtures.ts` puts every page and component on each user.
- **Shared parts are their own components,** such as `NavbarPage` for the menu and `AlertsPage` for messages, not an abstract layout base class.
- **Locators are `readonly` properties** set in the constructor. Every location strategy lives in page objects.
- **Everything that's the same on every run gets its own property,** whole sets included: each radio button (`lowPriorityRadio` to `urgentPriorityRadio`), each review section, each fixed message (`settingsSavedAlert`), each column checkbox and move button.
- **No `path` properties:** steps reach pages through the app. Each app's `NavbarPage` has a property for every link in its menu.
- **Methods are only for dynamic tables and lists:** rows found by a value the test creates or loops over, such as `productRow(sku)` or `approveButton(requestNumber)`. They return a `Locator`.
- **Lookup methods never read the page:** they build a locator and return it, so they're never `async`. A method that read the page first, such as a column's position from its headings, would fix what it read into the locator, and retrying couldn't correct it.
- **No methods for flows.**
- **No checks in page objects:** a page object never calls `expect(`. It gives the step the locator to check, as a property or from a lookup method, and the step checks it.
- **No step definitions in page objects:** playwright-bdd's decorator style, which turns page object methods into steps, isn't used.
- **No nested page objects:** a page object never holds another page object. Wizards and dialogs sit beside pages on each user, as in `adminUser.rejectDialog.confirmButton`.
- **Dialogs with a name or number in their title:** only one dialog is open at a time, so such a dialog's locator matches whichever is open. In the same way, `requestWizard` matches whichever of the three request wizards is open, for the steps the plan words the same way for all three. A step only one wizard has uses that wizard.
- **Scope each locator to its container:** radios inside their named group, controls inside their dialog or form. Check the app's source for the real structure.
- **Tables whose columns can be hidden or reordered:**
  - Find a cell by its column's heading, not its position: `allRequestsPage.statusCell(requestNumber, requesterName)`.
  - Match a row by values that are each in their own column.

## Naming

- **Every name says what it is:**
  - Users end in `User`: `standardUser`, `adminUser`, `standardSideUser`, `signedOutUser`.
  - Page objects end in `Page`, wizards in `Wizard`, dialogs in `Dialog`.
  - Fixtures, constants and `scenarioContext` values say what they hold: `testProduct`, `rejectionReason`, `deliveryAddress`, `scenarioContext.requestNumber`.
  - Never short names like `wizard`, `dialog`, `name` or `note`.
- **Users in step text** are the standard user, the admin user, the standard side user and the signed-out user, for `standardUser`, `adminUser`, `standardSideUser` and `signedOutUser`.
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

- **Steps ask for users by name,** as fixtures. Each user has their own browser, started from a saved session, with every page object on it, plus `page`, `account` and `keycloakPage`. A signed-in user's browser opens on the app's home page, so the navbar is there from the first step. The signed-out user's starts empty. See Playwright's [Testing multiple roles with POM fixtures](https://playwright.dev/docs/auth#testing-multiple-roles-with-pom-fixtures).
- **Sign in once,** in the setup project, and reuse the saved sessions, as in Playwright's [Multiple signed in roles](https://playwright.dev/docs/auth#multiple-signed-in-roles). `playwright/.auth` is git-ignored and kept out of pipeline artifacts.
- **Shared accounts** (`standardUser`, `adminUser`) run in many tests at once. Those tests never change the user's stored data, such as settings, and never sign out.
- **A scenario that changes the user's own data** uses `standardSideUser` and is tagged `@side-account`, which runs it on its own.
- **Passwords live only in environment variables** (`TEST_PASSWORD_<USERNAME>`: `.env` locally, masked variables in a pipeline). Never in repo files, reports or traces.
  - Type passwords with the base page's `fillSecret`, called on the page object that has the field: `await signedOutUser.keycloakPage.fillSecret(signedOutUser.keycloakPage.passwordInput, standardAccount.password);`
  - Tag a scenario that types a password `@no-trace`, which runs it in the `no-trace` project with traces off. A feature can't turn its own traces off the way a spec file's `test.use({ trace: 'off' })` does.
- **Failures:** screenshots are taken on failure, where password fields show as dots. Playwright's text copy of the page is turned off (`PLAYWRIGHT_NO_COPY_PROMPT`), because it shows what's in every field, passwords included.

## Test data and parallel runs

- Tests run side by side in one environment. Each scenario creates its own records with unique values, using the `test-data.ts` helpers and the test data fixtures, and checks only those.
- Rely on sample data only where no test changes it. Never check totals that other tests change.
- Find a test's row by searching or filtering for its unique value, not by paging or position.

## Configuration

- **Every setting is an environment variable,** kept in `.env` locally. A pipeline sets its own.
- **One app per run:** `TEST_APP_FOLDER` and `TEST_APP_URL` go together.
- **No named environments** (no `TEST_ENV`): set each app's URL.
- **Sharding:** keep runs ready to split across machines with Playwright's own `--shard` and blob reports. See Playwright's [Sharding](https://playwright.dev/docs/test-sharding).

## Formatting and linting

- Prettier with single quotes.
- Page objects, shared code and the README use a print width of 120.
- Step files use `--print-width 1000 --object-wrap collapse`, so each statement stays on one line. Never re-wrap them at 120. Prettier doesn't format feature files.
- **Lint with `npm run lint`** in `charlie-playwright` or `alpha-playwright`. It runs typescript-eslint's `no-floating-promises`, which Playwright's [Lint your tests](https://playwright.dev/docs/best-practices#lint-your-tests) recommends, so every Playwright call is awaited. It also runs two rules from `eslint-plugin-playwright`: `missing-playwright-await`, for retrying checks and `test.step`, and `prefer-web-first-assertions`, so no check reads a value from the page.

## Working on this project

- **"Discuss":** answer with options and a recommendation, then wait. Change no files until there's a go-ahead.
- **Which framework:** "Playwright" means `charlie-playwright`, which started on 2026-11-17 as a copy of `alpha-playwright`. Touch `alpha-playwright`, `beta-playwright` or `zed-playwright` only when they're named. These guidelines describe charlie, whose tests became Gherkin scenarios on 2026-11-17. The other folders still use spec files.
- **Git:** branch off `master` before committing. Commit, merge, push and delete the branch only when asked. No pull requests.
- **`.env`:** don't edit it. The user keeps it.
- **Example apps:** no deliberate gaps or planted bugs.
