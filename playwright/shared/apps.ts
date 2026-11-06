/**
 * The applications this project tests. TEST_APP picks one. To add an application, add it here and
 * to every environment in environments.ts, then give it a folder in apps/ (see README.md).
 */
export const APPS = {
  'super-catalog': {
    title: 'Super Catalog',
    testDir: 'apps/super-catalog/tests',
    /** Overrides the environment's address for this app. */
    urlVariable: 'SUPER_CATALOG_URL',
  },
  'super-portal': {
    title: 'Super Portal',
    testDir: 'apps/super-portal/tests',
    urlVariable: 'SUPER_PORTAL_URL',
  },
} as const;

export type AppName = keyof typeof APPS;
