# playwright-practice

Playwright + TypeScript UI tests for the local Research site (`http://127.0.0.1:8077`).
The tests are plain Playwright: no Page Object Model and no Gherkin. Each test carries the
ID of the manual case it automates.

## Layout

```
test-plans/          manual test plans: the source of truth for what each test proves
tests/               one spec file per feature area; test titles start with the case ID
support/fixtures.ts  the `test` and `expect` every spec imports: shared setup lives here
support/site-guard.ts the pages and requests tests are never allowed to make
playwright.config.ts  parallelism, browsers, base URL, reporters
Dockerfile, docker-compose.yml  run the suite in a container
```

## Run locally

The site must be running first.

```bash
npm ci
npx playwright install
npm test                 # all browsers, in parallel
npm run test:chromium    # one browser
npx playwright test -g "DATA-002"   # one manual case
```

Reviewing a test:

| Script | What it does |
| --- | --- |
| `npm run test:headed` | Watch it run in a visible browser, one worker |
| `npm run test:debug` | Step through it with the Playwright Inspector |
| `npm run test:ui` | UI mode: time-travel through each step |
| `npm run test:trace` | Record a trace for every test; open with `npm run report` |
| `npm run test:repeat` | Run each test 10 times to shake out flakiness |
| `npm run typecheck` | Type-check the specs and config |

## Run in Docker

Docker Desktop must be running, and so must the site.

```bash
npm run docker:build
npm run docker:test      # exits with the tests' exit code, like a pipeline step
npm run docker:down      # remove the stopped containers
```

The HTML report, `test-results/junit.xml` and any failure traces land in `playwright-report/` and
`test-results/` on this machine.

In a container, `127.0.0.1` means the container itself, and the local site rejects any request
not addressed to `127.0.0.1:8077` ("Invalid host header"). So compose runs a small `site-relay`
container (socat) that forwards port 8077 to this machine, and the tests container shares its
network. Inside the container the tests use the same `http://127.0.0.1:8077` as they do locally.

Against a hosted test environment, remove `site-relay` and `network_mode` from
`docker-compose.yml` and set `DOCKER_BASE_URL`. Set the number of parallel workers with `WORKERS`
(a count like `4`, or `50%` of the cores).

The image tag in the `Dockerfile` must match the `@playwright/test` version in `package.json`.
Upgrade both together.

## Parallelism

`fullyParallel: true` runs every test, in every file, in its own worker and browser context, so
tests must never depend on each other or on order. Playwright's default worker count is half the
CPU cores. Override it with `--workers=N` or the `WORKERS` variable. To split a pipeline run
across machines, use `--shard=1/3`, `--shard=2/3` and so on.

## Protected pages

Tests must never open Selected Strategies, Strategies, Rejected Strategies, Selected After Cost &
Tax, After Cost & Tax or Rejected After Cost & Tax. The site root redirects to Strategies, so no
test starts at `/`. Every page also has a "Rebuild pages" button that regenerates those pages.

`support/site-guard.ts` enforces this. The fixture it backs runs for every test automatically: it
blocks any browser request to those pages and anything other than a read (such as the rebuild
POST), then fails the test that tried.
