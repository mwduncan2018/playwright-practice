# Playwright tests

UI tests for Super Catalog and Super Portal, written in TypeScript with Playwright and page objects.
Each test automates one case from its application's manual test plan, a Word document in the app's
folder, and the test report shows that plan's steps word for word.

- [What's here](#whats-here)
- [Run the tests on your machine](#run-the-tests-on-your-machine)
- [Choosing what runs](#choosing-what-runs)
- [Which site to test](#which-site-to-test)
- [Tags](#tags)
- [Signing in](#signing-in)
- [Writing a test from the manual plan](#writing-a-test-from-the-manual-plan)
- [Adding an application](#adding-an-application)
- [Running in Docker](#running-in-docker)
- [Reports](#reports)
- [Code checks](#code-checks)
- [Upgrading Playwright](#upgrading-playwright)
- [Corporate certificates](#corporate-certificates)
- [For the DevOps lead](#for-the-devops-lead)

## What's here

```
apps/
  super-catalog/
    super-catalog-test-plan.docx   the manual test plan the tests follow
    pages/                         page objects: locators and actions, never checks
    fixtures.ts                    test, expect, and the catalog fixture with every page object
    test-data.ts                   the plan's test data
    test-files/                    files the plan uploads
    tests/                         one spec file per area, one test per manual case
  super-portal/                    the same for Super Portal
shared/
  accounts.ts                      roles, the test accounts, and which one each worker uses
  fixtures.ts                      signing in, and a second person in a test
  keycloak-sign-in.page.ts         Keycloak's sign-in page
  fill-secret.ts                   types a password without it showing in the report
  global-setup.ts                  checks the app answers before any test
  test-plan.ts, test-data.ts       links to the plan, and unique test data
playwright.config.ts               the TEST_* variables, parallelism, browsers and reporters
merge.config.ts                    merges sharded reports
Dockerfile, docker-compose.yml     the test image, and running it locally
eslint.config.mjs, .prettierrc.json  code checks
.env.example                       every local setting: copy it to .env
```

## Run the tests on your machine

The local environment must be running. From the repo root: `docker compose up -d --build --wait`.

```bash
cd zed-playwright
npm ci
npx playwright install
cp .env.example .env
npx playwright test
```

`npx playwright install` downloads the browsers, once per Playwright version. `.env` holds the local
settings: which app to test, the apps' addresses, and the test accounts' passwords. `npx playwright
test` runs every test for the app in `TEST_APP_FOLDER`, in parallel.

| Command                                                         | What it does                                            |
| --------------------------------------------------------------- | ------------------------------------------------------- |
| `npx playwright test`                                           | Every test for `TEST_APP_FOLDER`                        |
| `npx playwright test -g SC-004`                                 | One case                                                |
| `npx playwright test apps/super-catalog/tests/products.spec.ts` | One spec file                                           |
| `npx playwright test --grep @smoke`                             | Only the smoke tests                                    |
| `npm run test:headed`                                           | Watch the tests in a browser, one at a time             |
| `npm run test:ui`                                               | UI mode: step through each test and travel back in time |
| `npm run test:debug`                                            | Pause in the Playwright Inspector                       |
| `npm run test:list`                                             | List the tests that would run, without running them     |
| `npm run report`                                                | Open the last HTML report                               |
| `npm run check`                                                 | Type-check, lint and check formatting                   |

On Windows, Git Bash runs these as written. In PowerShell, copy the file with
`Copy-Item .env.example .env`, set a variable with `$env:TEST_APP_FOLDER = 'super-portal'` before running
the tests (it stays set in that window), and put quotes around a tag (`--grep '@smoke'`), because
PowerShell treats `@` as its own syntax.

VS Code's Playwright extension uses the same configuration and reads `TEST_APP_FOLDER` from `.env`, so it
lists that app's tests.

## Choosing what runs

Every setting is an environment variable, so the same names work on your machine (in `.env` or the
shell), in Docker (`-e`) and in a pipeline (CI variables).

| Variable                                | What it chooses                                           | Values                                              | Default                            |
| --------------------------------------- | --------------------------------------------------------- | --------------------------------------------------- | ---------------------------------- |
| `TEST_APP_FOLDER`                       | The application, by its folder in `apps/`                 | `super-catalog`, `super-portal`                     | None: required                     |
| `TEST_BROWSER`                          | Browsers, comma-separated                                 | `chromium`, `firefox`, `webkit`, `chrome`, `msedge` | `chromium`                         |
| `SUPER_CATALOG_URL`, `SUPER_PORTAL_URL` | The address of the app being tested                       | A full URL                                          | None: the tested app's is required |
| `TEST_RETRIES`                          | Retries for a failing test                                | A number                                            | `0`                                |
| `TEST_PASSWORD_<USERNAME>`              | A test account's password, such as `TEST_PASSWORD_ADMIN1` | Secret                                              | None                               |

- `TEST_APP_FOLDER` has no default, so one application runs at a time and nobody runs everything by accident.
- Settings aren't checked before they're used. A misspelled browser name, for example, runs the
  tests in Chromium under that name.
- Playwright's own options still work on top: `--grep`, `-g`, `--shard`, `--project`, `--headed`, a
  file path.
- `chrome` and `msedge` use Chrome or Edge as installed on the machine. The Docker image doesn't have
  them unless it adds them (`RUN npx playwright install --with-deps chrome msedge`).

## Which site to test

A run goes wherever the tested app's address variable says: `SUPER_CATALOG_URL` when `TEST_APP_FOLDER` is
`super-catalog`, `SUPER_PORTAL_URL` when it's `super-portal`. Only the tested app's address is read.
The variable is named after the app's folder, so renaming the folder changes which variable is read.
If it's missing, or isn't a full address, the run stops before any test, saying the app isn't reachable.

`.env.example` has the local Docker environment's addresses, so a local run needs nothing more. To
test a site somewhere else, change the address in `.env`, or override it for one run. A site whose
test accounts have different passwords needs those set too (`TEST_PASSWORD_*`).

```bash
SUPER_PORTAL_URL=https://super-portal.dev.example.com npx playwright test
```

The tests don't know whether an address is dev, test or staging, so a run executes every test it's
asked to. To run only part of the suite against a site, choose it with `--grep`. For example, a
staging job that should run only the smoke tests runs `npx playwright test --grep @smoke`.

Keycloak's address isn't set here. Browsers reach Keycloak by following the app's redirect, which is
set where the app is deployed.

## Tags

Tags work like Cucumber's: tag a test or a whole `describe` block, then choose with `--grep`.

```ts
test('SC-005 Create a product', { tag: '@smoke' }, async ({ catalog }) => {
  // ...
});

test.describe('Products', { tag: '@regression' }, () => {
  // every test in here is @regression
});
```

| To run                  | Command                        |
| ----------------------- | ------------------------------ |
| The smoke tests         | `--grep @smoke`                |
| Everything except smoke | `--grep-invert @smoke`         |
| Smoke or regression     | `--grep "@smoke\|@regression"` |
| One case                | `-g SC-004`                    |

Every test here is tagged `@smoke` or `@regression`, as its case is in the plan. Requiring two tags at
once is awkward in a regular expression, so keep the tags few.

Playwright also has annotations, but they aren't for choosing tests: they're notes in the report,
such as the link to the manual plan each test carries.

## Signing in

Both apps sign in through Keycloak, and `shared/fixtures.ts` takes care of it.

- **Once per account per worker.** Before a worker's first test, it signs in once as each role,
  through the real Keycloak page, and its tests reuse those sessions. Playwright hasn't started
  recording the test at that point, so no sign-in shows in a report or a trace. Sessions stay in
  memory, never in files.
- **Tests ask for a role, not an account.** `test.use({ signedInAs: 'admin' })` signs a file's or a
  describe block's tests in as an admin. `'standard'` is the default, and `'nobody'` gives a signed-out
  page for testing the sign-in page itself (SC-001).
- **Each worker has its own accounts.** Worker 1 uses `admin1` and `standard1`, worker 2 uses `admin2`
  and `standard2`, and so on, from the lists in `accounts.ts`. A run's two workers never share one.
  More than four workers, or several runs at once against one site, do share, so a test must not
  depend on an account's data staying as it left it. SP-010 is the exception: it changes a user's
  setting, so two copies running at once on one account, such as one per browser, can collide.
- **A second person.** `openPortalAs('admin')` gives a test an admin in a browser of their own: in
  SP-006 a standard user submits a request and an admin approves it. `accountFor('admin')` gives that
  admin's account, such as their name.
- **Passwords** come from `TEST_PASSWORD_<USERNAME>` variables: `.env` locally, masked CI variables in
  a pipeline. A missing or wrong password fails the tests that need that account, with a message
  naming the variable.
- **The sign-in test.** SC-001 types a password itself. It uses `fillSecret`, which keeps the
  password out of the report, and it records no trace.

## Writing a test from the manual plan

1. **One manual case is one test.** Its title starts with the case's ID and title:
   `SC-005 Create a product`.
2. **Each step is a `test.step`**, named with the plan's step number and action exactly as written:
   `1. Open the Products page and select New product.`
3. **Each check's message is the plan's expected result**, exactly as written:
   `expect(locator, 'The New product form opens.')`. When one expected result needs several checks,
   they share its message.
4. **Tag it as the plan does** (`@smoke` or `@regression`) and link it to the plan with
   `annotation: plan('SC-005')`. When the plan gets a new version, update `plan` in the app's
   `fixtures.ts`.
5. **Page objects hold locators and actions; tests hold the steps and the checks.** No `expect` in a
   page object.
6. **Locators:** role and accessible name first (`getByRole`, `getByLabel`), then visible text, then
   `getByTestId`. No CSS or XPath that follows the page's structure. The one exception is Keycloak's
   error message, which has neither a role nor a test ID (see `keycloak-sign-in.page.ts`).
7. **Tests run in parallel against one shared environment.** Create the records a test changes, with
   unique names (`shared/test-data.ts`). Only check sample data no test changes, never totals other
   tests can change, and put back any setting a test changes.
8. **Waiting:** Playwright's checks wait on their own. Before checking that something is absent
   (`toHaveCount(0)`), wait for the page to finish loading, as SC-010 does.
9. **Secrets:** never type one with `fill()`, whose step in the report shows what it typed. Use
   `fillSecret` from `shared/fill-secret.ts`, and turn the test's trace off with
   `test.use({ trace: 'off' })`, since a trace records what's typed and sent. For a second person,
   use `openPageAs` (or the app's version, such as `openPortalAs`), which is signed in before the
   test starts, rather than signing in during the test.

A test, shortened:

```ts
test('SC-005 Create a product', { tag: '@smoke', annotation: plan('SC-005') }, async ({ catalog, user }) => {
  const product = newTestProduct();

  await test.step('1. Open the Products page and select New product.', async () => {
    await catalog.products.goto();
    await catalog.products.newProduct.click();
    await expect(catalog.productForm.newProductHeading, 'The New product form opens.').toBeVisible();
  });
  // steps 2 and 3 ...
});
```

The HTML report lists the plan's steps in order, and under each one the checks, carrying the
expected results' wording.

Each test may take 60 seconds (Playwright's default is 30). Checks wait up to 10 seconds and actions
up to 15. A test known to be slow can call `test.slow()` to get three times as long.

## Adding an application

1. Choose its name for `TEST_APP_FOLDER`, such as `my-app`. Its tests go in `apps/my-app/tests`, and its
   address goes in a variable named after its folder, `MY_APP_URL`.
2. Add that variable, with the app's local address, to `.env.example`. Add its name to the
   `environment` list in `docker-compose.yml` too.
3. Create `apps/<name>/` with its test plan, `pages/`, `fixtures.ts` and `tests/`. Its `fixtures.ts`
   extends `shared/fixtures.ts` with a fixture holding its page objects, and defines its `plan`.
4. If it signs in on Keycloak's usual page, signing in already works. If not, change `signIn` in
   `shared/fixtures.ts` to follow its sign-in page.

## Running in Docker

The image is Playwright's own, which has the browsers and everything they need, plus this project.
The tag in the `Dockerfile` must match `@playwright/test` in `package.json`.

With the local environment running:

```bash
docker compose build
docker compose run --rm tests
docker compose run --rm -e TEST_APP_FOLDER=super-portal tests
docker compose run --rm -e TEST_BROWSER=firefox tests npx playwright test --grep @smoke
docker compose down
```

The run takes its settings from `.env`, and `-e` overrides them. Reports land in `reports/` on this
machine, and the exit code is the tests' (0 when every test passes). `docker compose down` stops the
relay.

**The relay, for local runs only.** The tests use `localhost:3001`, `localhost:3002` and
`localhost:8080`, the addresses the apps and Keycloak have on this machine and the ones Keycloak's
redirects use. Inside a container, localhost is the container itself. So the compose file runs a
small socat container on the local environment's Docker network, listening on those three ports and
forwarding them to the apps and Keycloak. The tests container shares its network, so localhost works
the same inside as outside. Real environments have real addresses and don't need it.

## Reports

| Where                | What                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `reports/html/`      | The HTML report: each test's steps and checks, plus a screenshot and trace when it failed. `npm run report` opens it.        |
| `reports/junit.xml`  | JUnit results, for a pipeline's test view. It lists tests, not steps.                                                        |
| `reports/artifacts/` | Failed tests' screenshots, traces and page snapshots (`error-context.md`). `npx playwright show-trace <file>` opens a trace. |
| `reports/blob/`      | A sharded run's report, waiting to be merged.                                                                                |

A [sharded run](#sharding) writes a blob report instead of the HTML and JUnit files. To merge, put
every shard's `.zip` in `reports/blob` and run `npm run merge-reports`. Each run empties
`reports/blob` first, so to try sharding on one machine, copy each shard's file out before running
the next.

## Code checks

| Command             | What it checks                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck` | TypeScript. Playwright runs tests without type-checking them, so run this too.                                                               |
| `npm run lint`      | ESLint with type information. `no-floating-promises` makes a forgotten `await` an error, and the Playwright plugin adds its rules for tests. |
| `npm run format`    | Prettier formats every file. `npm run format:check` only checks.                                                                             |
| `npm run check`     | All three, as a pipeline would run them before the tests.                                                                                    |

A `test.only` left in the code fails `npm run lint`. Nothing else stops it, and it would run that one
test and skip the rest, so a pipeline should run the checks before the tests.

The project uses TypeScript 6 because typescript-eslint, which the type-aware rules come from,
doesn't support TypeScript 7 yet.

## Upgrading Playwright

1. `npm install -D --save-exact @playwright/test@<version>`
2. Change the image tag in the `Dockerfile` to `v<version>-noble`.
3. `npx playwright install` for the new browsers, then run the tests.
4. Check that sign-ins still stay out of the report and traces, since that depends on the order
   Playwright sets fixtures up in. Run one app's tests with `--workers=1`, open the report, and
   expand the first test's Before Hooks. Its `storageState` fixture should hold no steps of its own.

## Corporate certificates

Behind a TLS-inspecting proxy, `npm ci` fails with `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`, and Node
can't reach https sites. Put the company's root CA certificate (`.crt`) in `zed-playwright/certs/` and
uncomment the three lines in the `Dockerfile`. They add it to the image's trust store and point Node
at it with `NODE_EXTRA_CA_CERTS`. Browsers keep trust stores of their own, so if pages also fail
with certificate errors, the image needs the CA added to them as well.

## For the DevOps lead

Everything a pipeline needs to run these tests. Nothing here depends on GitLab or Kubernetes.

### The image

- Build it from this folder: `docker build -t super-apps-tests playwright`. It holds no secrets
  (`.env` is excluded).
- It runs `npx playwright test`, and exits 0 when every test passes and 1 when any fails.
- It's configured by environment variables ([the table above](#choosing-what-runs)). A pipeline sets
  at least `TEST_APP_FOLDER`, the app's [address](#addresses) and the `TEST_PASSWORD_*` variables, masked.
- To run only part of the suite, override its command and add Playwright's options, such as
  `npx playwright test --grep @smoke`.
- It writes everything to `/app/reports`. A [sharded run](#sharding) writes
  `reports/blob/report-N.zip`; otherwise `reports/html/` and `reports/junit.xml`. Failures'
  screenshots and traces go to `reports/artifacts/`.
- Before any test, it checks that the app answers, so a site that's down fails in seconds with one
  message. If Keycloak is down, the tests that sign in fail with a message saying so.
- Pipelines don't need the local relay or the compose file.

### Addresses

The only addresses in the repo are the local ones in `.env.example`. Each run gets the tested app's
address from a variable, so changing an address means changing a CI variable, not the code:

| Variable            | Set it to                                                              |
| ------------------- | ---------------------------------------------------------------------- |
| `SUPER_CATALOG_URL` | Super Catalog's address, for runs with `TEST_APP_FOLDER=super-catalog` |
| `SUPER_PORTAL_URL`  | Super Portal's address, for runs with `TEST_APP_FOLDER=super-portal`   |

A missing or malformed address stops the run at once, saying the app isn't reachable. Nothing
in the tests depends on which environment an address belongs to, so a job that should run only part
of the suite chooses it with `--grep`. For example, a staging job that runs only the smoke tests
runs `npx playwright test --grep @smoke`.

### Sharding

- Every container runs the same image with the same variables, and its command sets its share with
  Playwright's own options: `npx playwright test --shard=1/10 --reporter=blob`, up to `--shard=10/10`.
  In a Kubernetes Indexed Job, the share comes from the `JOB_COMPLETION_INDEX` Kubernetes gives each
  pod (0 to 9), as in the [example below](#example-a-kubernetes-indexed-job).
- `--reporter=blob` writes a report for merging. Playwright's `PLAYWRIGHT_BLOB_OUTPUT_DIR=reports/blob`
  puts it with the other reports, where `npm run merge-reports` looks.
- Inside each container, two tests run at once, as set by `workers` in `playwright.config.ts`.
- Playwright divides tests between shards by count, not duration, so shards can finish at different
  times when tests vary a lot in length.
- To merge, collect every shard's `reports/blob/*.zip` into one `reports/blob` folder and run
  `npm run merge-reports`, in this folder or in the image. It writes `reports/html/` and
  `reports/junit.xml` for the whole run.

### Resources

These are recommendations to tune:

- **Workers and CPU.** Give each pod one CPU per worker: two for the two workers set in
  `playwright.config.ts`.
- **Memory.** About 1 GB per worker, plus 1 GB for the test runner.
- **Shared memory.** Chromium needs more than a container's default. Use `--ipc=host` or
  `--shm-size=1g` with Docker; in Kubernetes, mount an `emptyDir` with `medium: Memory` at `/dev/shm`.
- **An init process.** Run with `--init` (or an equivalent) so finished browser processes are cleaned
  up.

### Secrets and test data

- Passwords live in `TEST_PASSWORD_<USERNAME>` variables, masked and protected. No report or trace
  shows one: workers sign in before Playwright starts recording, and the one test that types a
  password (SC-001) keeps it out of its steps and records no trace.
- Masking covers only the job log. Traces hold session cookies and tokens, and screenshots and page
  snapshots show what was on the screen, so keep test artifacts where only the team can download
  them, and not for long.
- Each pod's workers use the accounts in `shared/accounts.ts` in order, so pods share accounts. That's
  fine for most tests, but SP-010 changes a user's setting, so runs that test different browsers at
  the same time against one site can collide on it. Run the browsers one after another, or
  add accounts: more accounts per role means less sharing.
- Tests create records with unique names and leave them behind. Long-lived environments will collect
  them; cleaning up is part of the test data discussion still to come.

### Example: GitLab CI

A sketch to adapt. It hasn't been run here. Each job runs in Playwright's image, from the checked-out
repo, and the passwords are masked CI/CD variables.

```yaml
e2e:
  image: mcr.microsoft.com/playwright:v1.64.1-noble
  parallel: 10
  variables:
    TEST_APP_FOLDER: super-portal
    SUPER_PORTAL_URL: https://super-portal.test.yourcompany.com
    PLAYWRIGHT_BLOB_OUTPUT_DIR: reports/blob
  script:
    - cd zed-playwright
    - npm ci
    - npx playwright test --shard="$CI_NODE_INDEX/$CI_NODE_TOTAL" --reporter=blob
  artifacts:
    when: always
    paths: [zed-playwright/reports/blob/]
    expire_in: 1 week

e2e-report:
  image: mcr.microsoft.com/playwright:v1.64.1-noble
  needs: [e2e]
  when: always
  script:
    - cd zed-playwright
    - npm ci
    - npm run merge-reports
  artifacts:
    when: always
    paths: [zed-playwright/reports/html/, zed-playwright/reports/junit.xml]
    reports:
      junit: zed-playwright/reports/junit.xml
```

### Example: a Kubernetes Indexed Job

Also a sketch, not run here. It assumes the image is in your registry and the passwords are in a
Secret named `e2e-passwords`, whose keys are the `TEST_PASSWORD_*` names. Each pod's `reports/blob`
still has to be copied out for merging, with a shared volume or an upload step.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: e2e-super-portal
spec:
  completionMode: Indexed
  completions: 10
  parallelism: 10
  backoffLimit: 0
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: tests
          image: registry.example.com/super-apps-tests:1.0.0
          command: ['sh', '-c', 'npx playwright test --shard=$((JOB_COMPLETION_INDEX + 1))/10 --reporter=blob']
          env:
            - { name: TEST_APP_FOLDER, value: super-portal }
            - { name: SUPER_PORTAL_URL, value: 'https://super-portal.test.yourcompany.com' }
            - { name: PLAYWRIGHT_BLOB_OUTPUT_DIR, value: reports/blob }
          envFrom:
            - secretRef: { name: e2e-passwords }
          resources:
            requests: { cpu: '2', memory: 3Gi }
            limits: { cpu: '2', memory: 3Gi }
          volumeMounts:
            - { name: shm, mountPath: /dev/shm }
      volumes:
        - name: shm
          emptyDir: { medium: Memory, sizeLimit: 1Gi }
```
