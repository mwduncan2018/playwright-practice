import { Link } from 'react-router';

import { usePageTitle } from '../usePageTitle';

export default function AccessDeniedPage() {
  usePageTitle('Access denied');
  return (
    <div className="py-4">
      <h1 className="h3">You don't have access to this page</h1>
      <p>Only admins can create, change or delete records, or see the activity log.</p>
      <Link to="/">Go to the dashboard</Link>
    </div>
  );
}
