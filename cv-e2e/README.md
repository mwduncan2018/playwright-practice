# cv-e2e

Playwright end-to-end tests.

## Environment variables

Every setting is an environment variable. For local runs, copy `.env.example` to `.env` and put in
your values. Git ignores `.env`.

A variable set in the shell overrides `.env`. A pipeline has no `.env`, so it must set these itself.

| Variable              | What it sets                                     | Values                                              | If not set                                |
| --------------------- | ------------------------------------------------ | --------------------------------------------------- | ----------------------------------------- |
| `TEST_APP_FOLDER`     | The folder of tests to run                       | A path from this folder, like `tests/app1`          | Every test in this project runs           |
| `TEST_APP_URL`        | The app's address, which `page.goto('/')` uses   | A full URL, like `https://playwright.dev/`          | `page.goto('/')` doesn't work             |
| `TEST_BROWSER`        | The browser to run in                            | `chromium`, `firefox`, `webkit`, `msedge`, `chrome` | "No tests found"                          |
| `TEST_PARALLEL`       | Whether tests in the same file run at one time   | `true` turns it on; anything else is off            | Off                                       |
| `TEST_RETRIES`        | How many times a failing test is retried         | A whole number                                      | `0`                                       |
| `TEST_WORKERS`        | How many tests run at once                       | A whole number, not a percentage                    | Half the CPU cores                        |
| `TEST_TRACE`          | When a test's trace is recorded and kept         | A trace mode, listed in `.env.example`              | `on-first-retry`                          |
| `TEST_HISTORY_KEEP`   | How many local runs `playwright-history` keeps   | A whole number                                      | `20`                                      |
| `TEST_ADMIN_USERNAME` | The admin account's username                     | A username                                          | No effect yet: no test reads it           |
| `TEST_ADMIN_PASSWORD` | The admin account's password                     | A password                                          | No effect yet: no test reads it           |

- `TEST_APP_FOLDER` and `TEST_APP_URL` go together. If they don't match, one app's tests run against
  the other app's site.
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
`tests/app1/pages/playwright-home.page.ts` is the home page of app1's site.
