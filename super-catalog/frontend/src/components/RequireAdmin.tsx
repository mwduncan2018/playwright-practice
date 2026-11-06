import type { ReactNode } from 'react';

import { useAuth } from '../auth';
import AccessDeniedPage from '../pages/AccessDeniedPage';

/** Admin-only pages. A standard user who opens one by its address sees Access denied. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  return useAuth().user.isAdmin ? children : <AccessDeniedPage />;
}
