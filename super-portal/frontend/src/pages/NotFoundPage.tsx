import { Link } from 'react-router';

import { usePageTitle } from '../usePageTitle';

export default function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <div className="py-4">
      <h1 className="h3">Page not found</h1>
      <p>There's no page at this address.</p>
      <Link to="/">Go to the home page</Link>
    </div>
  );
}
