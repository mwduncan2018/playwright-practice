# Other laptop to do

## Fix `eslint.config.ts` and add the Playwright lint rules

The project on the other laptop uses Yarn 1 and already has an `eslint.config.ts`.

### 1. Fix two likely mistakes in the current file

- `files: ["**/*.{ts}"]` probably matches no files. Curly braces only expand when they hold a comma, as in `{ts,tsx}`,
  so `{ts}` is read as the literal text `{ts}`. Change it to `"**/*.ts"`.
- `"@unused-imports/no-unused-imports"` doesn't match the plugin's registered name, `"unused-imports"`. Change it to
  `"unused-imports/no-unused-imports"`.

Either one may only have been a typo when the file was copied into chat. Check the real file.

### 2. Install the Playwright plugin

```bash
yarn add -D eslint-plugin-playwright
```

### 3. Update `eslint.config.ts`

Keep any lines in the real file that aren't shown here. The changes are:

- the `playwright` import
- the fixed `files` pattern
- `parserOptions`
- the `playwright` plugin
- the fixed unused-imports rule
- the last three rules

```ts
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintPluginUnusedImports from "eslint-plugin-unused-imports";
import playwright from "eslint-plugin-playwright";

export default defineConfig([
  globalIgnores(["dist", "playwright-report", "test-results", "blob-report"]),
  {
    files: ["**/*.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "unused-imports": eslintPluginUnusedImports,
      playwright,
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "playwright/missing-playwright-await": "error",
      "playwright/prefer-web-first-assertions": "error",
    },
  },
]);
```

Put the new rules in the existing block, not a new one. `tseslint.configs.recommended` already registers the
`@typescript-eslint` plugin there, and registering it again in a second block can cause "Cannot redefine plugin".

### 4. Run it

```bash
yarn eslint .
```

If `package.json` has a lint script, run that instead.

- If it reports that `eslint.config.ts` "was not found by the project service", change the `projectService` line to
  `projectService: { allowDefaultProject: ["eslint.config.ts"] },`.
- If it reports other files that way, add their folders to `include` in `tsconfig.json`.
- If it can't load a TypeScript config file, run `yarn add -D jiti`.

### 5. Fix what it finds

Expect new errors the first time:

- The fixed `files` pattern turns on all the existing rules for `.ts` files.
- The three new rules find missing `await`s and manual checks such as `expect(await locator.innerText())`.

`yarn eslint . --fix` fixes some of them, mainly a missing `await` in front of `expect`. Fix the rest by hand, or agree
with the team when to fix them.

### 6. Commit

Commit `eslint.config.ts`, `package.json` and `yarn.lock` together.
