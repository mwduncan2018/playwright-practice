import { test as base, expect } from '@playwright/test';
import { blockReason } from './site-guard';

type Fixtures = {
  /** Keeps every test read-only and away from the protected pages. Runs automatically. */
  siteGuard: void;
};

/**
 * Every spec imports `test` and `expect` from here instead of '@playwright/test',
 * so shared setup lives in one place.
 */
export const test = base.extend<Fixtures>({
  siteGuard: [
    async ({ context, baseURL }, use) => {
      if (!baseURL) throw new Error('baseURL is not set; check playwright.config.ts');
      const siteOrigin = new URL(baseURL).origin;
      const blocked: string[] = [];

      // Routing on the context also covers popups and new tabs the test opens.
      await context.route('**/*', async (route) => {
        const request = route.request();
        const reason = blockReason(request.method(), request.url(), siteOrigin);
        if (reason) {
          blocked.push(reason);
          await route.abort('blockedbyclient');
        } else {
          await route.continue();
        }
      });

      await use();

      expect(blocked, 'The test tried to open a protected page or change the site').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
