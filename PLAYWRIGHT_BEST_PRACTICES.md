# Playwright best practices

Practices from Playwright's own documentation, and how this repo follows them.

## Check page state with web-first assertions

Check what the page shows with Playwright's `expect(` on a locator or on the page. Don't read a value or the page's state with a "get" method and then compare it.

```ts
await expect(adminUser.requestPage.statusValue, 'The status is Approved.').toHaveText('Approved');
```

Not:

```ts
expect(await adminUser.requestPage.statusValue.innerText()).toBe('Approved');
```

The `await` goes in front of `expect(`, not inside it.

### What Playwright's documentation says

- [Best Practices: Use web first assertions](https://playwright.dev/docs/best-practices#use-web-first-assertions) contrasts `await expect(page.getByText('welcome')).toBeVisible()`, which it recommends, with `expect(await page.getByText('welcome').isVisible()).toBe(true)`, which it doesn't. Its sub-section [Don't use manual assertions](https://playwright.dev/docs/best-practices#dont-use-manual-assertions) explains that `isVisible()` checks once and returns straight away, without waiting.
- [Assertions](https://playwright.dev/docs/test-assertions#auto-retrying-assertions) splits checks into two kinds. Auto-retrying assertions, such as `toHaveText`, `toBeVisible`, `toHaveCount`, `toHaveURL` and `toHaveTitle`, keep trying until they pass or their timeout runs out (5 seconds by default). [Non-retrying assertions](https://playwright.dev/docs/test-assertions#non-retrying-assertions), such as `toBe` and `toEqual`, check once. Pages show information asynchronously, so checking once can make a test flaky, and the page's advice is: "Prefer auto-retrying assertions whenever possible."
- The [Locator API](https://playwright.dev/docs/api/class-locator#locator-text-content) entry for `textContent()` says to prefer `toHaveText()` to avoid flakiness. `count()` and `allTextContents()` carry similar notes, pointing to `toHaveCount()` and `toHaveText()`.

### Why waiting works better

- A "get" method reads the page at one instant, sometimes before the page has caught up, such as while a list is still loading or a message is about to appear. `isVisible()` doesn't wait at all.
- An assertion keeps looking until the page matches or its time runs out, so a slow page isn't a failure.
- When an assertion does fail, it shows what it expected, what it found, and the locator it used.

### Which assertion replaces which "get"

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

### When reading a value is fine

- **To pass a value to a later step**, such as a new request's number:

  ```ts
  return (await standardUser.equipmentWizard.newRequestNumberText.innerText()).trim();
  ```

- **For a check no assertion can express**, such as comparing numbers or putting values in order. Wrap the read in [`expect.poll`](https://playwright.dev/docs/test-assertions#expectpoll), so it's retried like an assertion:

  <!-- prettier-ignore -->
  ```ts
  await expect.poll(async () => Number(await adminUser.dashboardPage.productsCardNumber.innerText()), 'The Products count is more than 60.').toBeGreaterThan(60);
  ```

  For a block of several steps that must pass together, use [`expect(...).toPass()`](https://playwright.dev/docs/test-assertions#expecttopass). It doesn't use the assertion timeout, so give it a `timeout` of its own.

### In this repo

- Every check in alpha-playwright's tests is a retrying assertion on a locator or a page.
- The base page's `getCurrentUrl()` and `getTabTitle()` read once, without waiting. Tests check the address and the tab title with `expect(<user>.page).toHaveURL(...)` and `toHaveTitle(...)` instead.
- Page objects return locators, never values or true or false, so every check stays an assertion in the test.
