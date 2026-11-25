import { Link } from 'react-router';

import { usePageTitle } from '../usePageTitle';

export default function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <div className="py-4">
      <h1 className="h3" data-testid="page-not-found-heading">
        Page not found
      </h1>
      <p data-testid="page-not-found-text">There's no page at this address.</p>
      <Link to="/" data-testid="page-not-found-home-link">
        Go to the home page
      </Link>
    </div>
  );
}
