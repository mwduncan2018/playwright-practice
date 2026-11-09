/**
 * The applications this project tests. TEST_APP picks one. To add an application, add it here,
 * then give it a folder in apps/ (see README.md).
 */
export const APPS = {
  'super-catalog': {
    title: 'Super Catalog',
    testDir: 'apps/super-catalog/tests',
    /** The variable holding this app's address, which a run testing this app requires. */
    urlVariable: 'SUPER_CATALOG_URL',
  },
  'super-portal': {
    title: 'Super Portal',
    testDir: 'apps/super-portal/tests',
    urlVariable: 'SUPER_PORTAL_URL',
  },
} as const;

export type AppName = keyof typeof APPS;
