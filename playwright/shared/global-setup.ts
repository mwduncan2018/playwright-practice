import { APPS } from './apps';
import { settings } from './settings';

/**
 * Runs once before any test: checks the application and Keycloak answer, so an environment that's
 * down gives one clear message instead of every test timing out.
 */
export default async function globalSetup(): Promise<void> {
  const checks: [string, string][] = [
    [APPS[settings.app].title, `${settings.appUrl}/`],
    ['Keycloak', `${settings.keycloakUrl}/realms/${settings.realm}/.well-known/openid-configuration`],
  ];
  for (const [name, url] of checks) {
    let problem: string | undefined;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) problem = `it answered ${response.status} ${response.statusText}`;
    } catch (error) {
      const cause = error instanceof Error && error.cause instanceof Error ? error.cause : error;
      problem = cause instanceof Error ? cause.message : String(cause);
    }
    if (problem) {
      throw new Error(
        `${name} isn't reachable at ${url} (${problem}). Is the ${settings.environment} environment running? ` +
          'For local, run "docker compose up -d --wait" in the repo root.',
      );
    }
  }
}
