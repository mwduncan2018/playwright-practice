# Conventions for writing tests here

Tests are generated from the manual plans in `test-plans/` and reviewed by a person. Write them
so a reviewer can check each test against its manual case without opening another file.

- Import `test` and `expect` from `support/fixtures`, never from `@playwright/test`.
- Start every test title with the manual case ID, for example `DATA-002 open "Calm days" from the index`.
- One manual case is one test. A case with a data table is one test per row, generated with a `for` loop.
- Keep the case's actions and every expected result visible in the test. Each expected result in the
  plan maps to an `expect`. Use `test.step()` with the plan's wording when a case has several steps.
- No Page Object Model and no Gherkin. Add a helper to `support/` only when the same multi-step
  interaction repeats across many tests, and keep assertions out of helpers.
- Locate elements by role and accessible name first (`getByRole`, `getByLabel`), then visible text,
  then `getByTestId`. Never use CSS or XPath tied to page structure. If nothing stable identifies an
  element, say so instead of guessing.
- Tests run fully in parallel: no shared state, no dependence on order or on another test's data.
- Never open the protected pages listed in `support/site-guard.ts`, never `page.goto('/')`, and never
  click "Rebuild pages", Select or Reject.
- The plan is the source of truth. If the running site disagrees with the plan, report the
  difference; don't change the expected result to match the site.

After writing or changing tests, run `npm run typecheck` and `npx playwright test`.
