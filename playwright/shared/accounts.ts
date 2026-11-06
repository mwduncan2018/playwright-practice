import { ENVIRONMENTS } from './environments';
import { settings } from './settings';

/** The roles tests sign in as. Every environment has test accounts for each one. */
export const ROLES = ['admin', 'standard'] as const;
export type Role = (typeof ROLES)[number];

export interface Account {
  role: Role;
  username: string;
  /** The name the applications show, such as "Admin One". */
  name: string;
  password: string;
}

/** The variable that holds an account's password: TEST_PASSWORD_ADMIN1 for admin1. */
export function passwordVariable(username: string): string {
  return `TEST_PASSWORD_${username.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
}

/**
 * The account a worker uses for a role. Worker 1 gets the role's first account, worker 2 the
 * second, and so on, so with four accounts per role, four workers never share one.
 */
export function accountForWorker(role: Role, workerIndex: number): Account {
  const accounts = ENVIRONMENTS[settings.environment].accounts[role];
  const { username, name } = accounts[workerIndex % accounts.length];
  const variable = passwordVariable(username);
  const password = process.env[variable];
  if (!password) {
    throw new Error(
      `${variable} isn't set, so the tests can't sign in as ${username}. ` +
        'Set it in playwright/.env locally, or as a masked CI variable.',
    );
  }
  return { role, username, name, password };
}
