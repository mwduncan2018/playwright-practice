/** The roles tests sign in as. */
export const ROLES = ['admin', 'standard'] as const;
export type Role = (typeof ROLES)[number];

export interface Account {
  role: Role;
  username: string;
  /** The name the applications show, such as "Admin One". */
  name: string;
  password: string;
}

/**
 * The test accounts for each role. Tests ask for a role, and each parallel worker gets its own
 * account. Passwords come from variables.
 */
export const ACCOUNTS: Record<Role, Pick<Account, 'username' | 'name'>[]> = {
  admin: [
    { username: 'admin1', name: 'Admin One' },
    { username: 'admin2', name: 'Admin Two' },
    { username: 'admin3', name: 'Admin Three' },
    { username: 'admin4', name: 'Admin Four' },
  ],
  standard: [
    { username: 'standard1', name: 'Standard One' },
    { username: 'standard2', name: 'Standard Two' },
    { username: 'standard3', name: 'Standard Three' },
    { username: 'standard4', name: 'Standard Four' },
  ],
};

/** The variable that holds an account's password: TEST_PASSWORD_ADMIN1 for admin1. */
export function passwordVariable(username: string): string {
  return `TEST_PASSWORD_${username.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
}

/**
 * The account a worker uses for a role. Worker 1 gets the role's first account, worker 2 the
 * second, and so on, so with four accounts per role, four workers never share one.
 */
export function accountForWorker(role: Role, workerIndex: number): Account {
  const accounts = ACCOUNTS[role];
  const { username, name } = accounts[workerIndex % accounts.length];
  const variable = passwordVariable(username);
  const password = process.env[variable];
  if (!password) {
    throw new Error(
      `${variable} isn't set, so the tests can't sign in as ${username}. ` +
        'Set it in zed-playwright/.env locally, or as a masked CI variable.',
    );
  }
  return { role, username, name, password };
}
