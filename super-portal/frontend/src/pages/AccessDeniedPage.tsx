import { Link } from 'react-router';

import { usePageTitle } from '../usePageTitle';

export default function AccessDeniedPage() {
  usePageTitle('Access denied');
  return (
    <div className="py-4">
      <h1 className="h3">You don't have access to this page</h1>
      <p>Approvals, all requests and reports are only for admins.</p>
      <Link to="/">Go to the home page</Link>
    </div>
  );
}
