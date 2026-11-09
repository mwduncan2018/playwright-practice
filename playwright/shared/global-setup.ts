import { APPS } from './apps';
import { settings } from './settings';

/**
 * Why a request failed. A refused "localhost" fails with an AggregateError, which has no message of
 * its own: it holds one error for each of localhost's addresses, so this uses the first.
 */
function reasonFor(error: unknown): string {
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause : error;
  const reason: unknown = cause instanceof AggregateError ? cause.errors[0] : cause;
  return reason instanceof Error ? reason.message : String(reason);
}

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
      problem = reasonFor(error);
    }
    if (problem !== undefined) {
      throw new Error(
        `${name} isn't reachable at ${url} (${problem}). Is the ${settings.environment} environment running? ` +
          'For local, run "docker compose up -d --wait" in the repo root.',
      );
    }
  }
}
