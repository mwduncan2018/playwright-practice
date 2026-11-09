# cv-e2e

Playwright end-to-end tests.

## Environment variables

Every setting is an environment variable. For local runs, copy `.env.example` to `.env` and put in
your values. Git ignores `.env`.

A variable set in the shell overrides `.env`. A pipeline has no `.env`, so it must set these itself.

| Variable              | What it sets                                     | Values                                     | If not set                                |
| --------------------- | ------------------------------------------------ | ------------------------------------------ | ----------------------------------------- |
| `TEST_APP_FOLDER`     | The folder of tests to run                       | A path from this folder, like `tests/app1` | Every test in this project runs           |
| `TEST_APP_URL`        | The app's address, which `page.goto('/')` uses   | A full URL, like `https://playwright.dev/` | `page.goto('/')` doesn't work             |
| `TEST_BROWSER`        | The browser to run in                            | `chromium`, `firefox` or `webkit`          | "No tests found"                          |
| `TEST_PARALLEL`       | Whether tests in the same file run at one time   | `true` turns it on; anything else is off   | Off                                       |
| `TEST_RETRIES`        | How many times a failing test is retried         | A whole number                             | `0`                                       |
| `TEST_WORKERS`        | How many tests run at once                       | A whole number, not a percentage           | Half the CPU cores                        |
| `TEST_ADMIN_USERNAME` | The admin account's username                     | A username                                 | No effect yet: no test reads it           |
| `TEST_ADMIN_PASSWORD` | The admin account's password                     | A password                                 | No effect yet: no test reads it           |

- `TEST_APP_FOLDER` and `TEST_APP_URL` go together. If they don't match, one app's tests run against
  the other app's site.
- Keep real passwords in `.env` or in masked pipeline variables, never in `.env.example`.
- `CI` isn't set by you: most pipelines set it automatically. When it's set, a run that contains
  `test.only` fails.
