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
 * Runs once before any test: checks the application answers, so a site that's down gives one clear
 * message instead of every test timing out.
 */
export default async function globalSetup(): Promise<void> {
  const { title, urlVariable } = APPS[settings.app];
  let problem: string | undefined;
  try {
    const response = await fetch(`${settings.appUrl}/`, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) problem = `it answered ${response.status} ${response.statusText}`;
  } catch (error) {
    problem = reasonFor(error);
  }
  if (problem !== undefined) {
    throw new Error(
      `${title} isn't reachable at ${settings.appUrl} (${problem}). Check ${urlVariable}, and that the site is ` +
        'running. For the local Docker environment, run "docker compose up -d --wait" in the repo root.',
    );
  }
}
