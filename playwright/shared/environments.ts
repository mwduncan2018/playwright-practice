import type { Role } from './accounts';
import type { AppName } from './apps';

export interface AccountName {
  username: string;
  /** The name the applications show for this user, such as "Admin One". */
  name: string;
}

export interface Environment {
  /** Each application's address. Only local lists these; see ENVIRONMENTS below. */
  apps?: Record<AppName, string>;
  /** Keycloak's address, as browsers see it. Only local lists this too. */
  keycloakUrl?: string;
  realm: string;
  /** Run only the tests tagged @smoke, whatever else is asked for. */
  smokeOnly: boolean;
  /**
   * The test accounts for each role. Tests ask for a role, and each parallel worker gets its own
   * account: worker 1 the first, worker 2 the second, and so on. Passwords come from variables.
   */
  accounts: Record<Role, AccountName[]>;
}

const ACCOUNTS: Record<Role, AccountName[]> = {
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

/**
 * What differs between environments. TEST_ENV picks one. Only local has addresses here, because
 * they never change. The others get theirs from the variables SUPER_CATALOG_URL, SUPER_PORTAL_URL
 * and KEYCLOAK_URL, set in the pipeline, so changing an address doesn't need a code change.
 */
export const ENVIRONMENTS = {
  local: {
    apps: { 'super-catalog': 'http://localhost:3001', 'super-portal': 'http://localhost:3002' },
    keycloakUrl: 'http://localhost:8080',
    realm: 'super-apps',
    smokeOnly: false,
    accounts: ACCOUNTS,
  },
  dev: { realm: 'super-apps', smokeOnly: false, accounts: ACCOUNTS },
  test: { realm: 'super-apps', smokeOnly: false, accounts: ACCOUNTS },
  staging: { realm: 'super-apps', smokeOnly: true, accounts: ACCOUNTS },
} satisfies Record<string, Environment>;

export type EnvironmentName = keyof typeof ENVIRONMENTS;
