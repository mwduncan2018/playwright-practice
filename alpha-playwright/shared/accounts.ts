import path from 'node:path';

export type Role = 'admin' | 'standard';

export interface Account {
  role: Role;
  username: string;
  name: string;
  password: string;
}

export const ACCOUNTS = {
  admin: { role: 'admin', username: 'admin1', name: 'Admin One' },
  standard: { role: 'standard', username: 'standard1', name: 'Standard One' },
  'standard-side': { role: 'standard', username: 'standard2', name: 'Standard Two' },
} as const satisfies Record<string, Omit<Account, 'password'>>;

export type AccountName = keyof typeof ACCOUNTS;
export const ACCOUNT_NAMES = Object.keys(ACCOUNTS) as AccountName[];

export function passwordVariable(username: string): string {
  return `TEST_PASSWORD_${username.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
}

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

export function sessionFile(accountName: AccountName): string {
  return path.join(__dirname, '..', 'playwright', '.auth', `${accountName}.json`);
}
