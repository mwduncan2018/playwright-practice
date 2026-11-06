import { useCallback, useEffect, useState } from 'react';

import { type Auth, useAuth } from './auth';

/** An API failure with a message fit to show. `field` names the form field it's about, if any. */
export class ApiError extends Error {
  readonly status: number;
  readonly field?: string;

  constructor(status: number, message: string, field?: string) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

export async function callApi<T>(auth: Auth, path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${await auth.getToken()}`);
  if (typeof init.body === 'string') headers.set('Content-Type', 'application/json');
  const response = await fetch(path, { ...init, headers });
  if (!response.ok) throw await toApiError(response);
  return (response.status === 204 ? undefined : await response.json()) as T;
}

async function toApiError(response: Response): Promise<ApiError> {
  let detail: unknown;
  try {
    detail = ((await response.json()) as { detail?: unknown }).detail;
  } catch {
    // Not JSON: use the general message below.
  }
  if (typeof detail === 'string') return new ApiError(response.status, detail);
  if (detail && typeof detail === 'object' && 'message' in detail) {
    const { message, field } = detail as { message: string; field?: string };
    return new ApiError(response.status, message, field);
  }
  if (response.status === 403) return new ApiError(403, "You don't have permission to do that.");
  return new ApiError(response.status, `Something went wrong (error ${response.status}). Try again.`);
}

export function asApiError(error: unknown): ApiError {
  return error instanceof ApiError
    ? error
    : new ApiError(0, "Couldn't reach Super Portal. Check your connection and try again.");
}

/** Calls the API as the signed-in user. */
export function useApi() {
  const auth = useAuth();
  return useCallback(<T,>(path: string, init?: RequestInit) => callApi<T>(auth, path, init), [auth]);
}

export interface Loaded<T> {
  data?: T;
  error?: ApiError;
  loading: boolean;
  reload(): void;
}

/**
 * Loads a path, and again whenever the path changes. Earlier data stays on screen while the next
 * request runs, and only the latest response is kept. A null path loads nothing.
 */
export function useLoad<T>(path: string | null): Loaded<T> {
  const api = useApi();
  const [state, setState] = useState<{ data?: T; error?: ApiError; loading: boolean }>({ loading: path !== null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (path === null) return;
    let latest = true;
    setState((previous) => ({ ...previous, loading: true }));
    api<T>(path).then(
      (data) => {
        if (latest) setState({ data, loading: false });
      },
      (error: unknown) => {
        if (latest) setState({ error: asApiError(error), loading: false });
      },
    );
    return () => {
      latest = false;
    };
  }, [api, path, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, reload };
}
