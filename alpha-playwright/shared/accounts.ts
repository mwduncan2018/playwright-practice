import path from 'node:path';

/** The roles the apps have. */
export type Role = 'admin' | 'standard';

export interface Account {
  role: Role;
  username: string;
  /** The name the applications show, such as "Admin One". */
  name: string;
  password: string;
}

/**
 * The accounts tests sign in as. Many tests use a shared account at the same time, so those tests
 * mustn't change anything stored for the user. A test that does, such as one that changes Settings,
 * uses a side account instead and is tagged @side-account, which runs it one test at a time.
 */
export const ACCOUNTS = {
  admin: { role: 'admin', username: 'admin1', name: 'Admin One' },
  standard: { role: 'standard', username: 'standard1', name: 'Standard One' },
  'standard-side': { role: 'standard', username: 'standard2', name: 'Standard Two' },
} as const satisfies Record<string, Omit<Account, 'password'>>;

export type AccountName = keyof typeof ACCOUNTS;
export const ACCOUNT_NAMES = Object.keys(ACCOUNTS) as AccountName[];

/** The variable that holds an account's password: TEST_PASSWORD_ADMIN1 for admin1. */
export function passwordVariable(username: string): string {
  return `TEST_PASSWORD_${username.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
}

/** An account, with its password from its variable. */
export function account(accountName: AccountName): Account {
  const { role, username, name } = ACCOUNTS[accountName];
  const passwordVariableName = passwordVariable(username);
  const password = process.env[passwordVariableName];
  if (!password) {
    throw new Error(
      `${passwordVariableName} isn't set, so the tests can't sign in as ${username}. ` +
        'Set it in alpha-playwright/.env locally, or as a masked CI variable.',
    );
  }
  return { role, username, name, password };
}

/**
 * Where the setup project saves an account's signed-in session, and where tests load it from. The
 * folder is git-ignored. The files hold sign-in cookies, so keep them out of pipeline artifacts too.
 */
export function sessionFile(accountName: AccountName): string {
  return path.join(__dirname, '..', 'playwright', '.auth', `${accountName}.json`);
}
