import { defineConfig } from '@playwright/test';

// For npm run merge-reports: turns the blob reports from sharded runs (reports/blob) into one HTML
// report and one JUnit file, as an unsharded run would have written.
export default defineConfig({
  testDir: 'apps',
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
});
