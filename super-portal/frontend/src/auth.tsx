import Keycloak from 'keycloak-js';
import { createContext, useContext } from 'react';

export interface CurrentUser {
  username: string;
  name: string;
  email: string;
  roles: string[];
  isAdmin: boolean;
}

export interface Auth {
  user: CurrentUser;
  /** A fresh access token for an API call. Signs in again if the session has ended. */
  getToken(): Promise<string>;
  signOut(): void;
  /** Keycloak's own account page. */
  accountUrl: string;
}

interface AppConfig {
  keycloakUrl: string;
  realm: string;
  clientId: string;
}

const APP_ROLES = ['admin', 'standard'];

/**
 * Reads where Keycloak is from the server, then signs in. A browser that isn't signed in goes to
 * Keycloak's sign-in page and comes back here, so this only resolves for a signed-in user.
 */
export async function startAuth(): Promise<Auth> {
  const response = await fetch('/config.json');
  if (!response.ok) throw new Error(`Couldn't load the app settings (error ${response.status}).`);
  const config = (await response.json()) as AppConfig;

  const keycloak = new Keycloak({ url: config.keycloakUrl, realm: config.realm, clientId: config.clientId });
  await keycloak.init({ onLoad: 'login-required', pkceMethod: 'S256', checkLoginIframe: false });

  const claims = keycloak.tokenParsed ?? {};
  const roles = (claims.realm_access?.roles ?? []).filter((role) => APP_ROLES.includes(role));
  const username = String(claims.preferred_username ?? '');
  return {
    user: {
      username,
      name: String(claims.name ?? username),
      email: String(claims.email ?? ''),
      roles,
      isAdmin: roles.includes('admin'),
    },
    async getToken() {
      try {
        await keycloak.updateToken(30);
      } catch {
        await keycloak.login();
      }
      return keycloak.token ?? '';
    },
    signOut() {
      void keycloak.logout({ redirectUri: `${window.location.origin}/` });
    },
    accountUrl: keycloak.createAccountUrl(),
  };
}

const AuthContext = createContext<Auth | null>(null);
export const AuthProvider = AuthContext.Provider;

export function useAuth(): Auth {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used inside AuthProvider');
  return auth;
}
