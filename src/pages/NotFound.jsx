import { Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';

function NotFound() {
  const location = useLocation();
  return (
    <Card>
      <EmptyState icon={Compass} title="Page not found" message={`There's nothing at “${location.pathname}”.`}>
        <Link to="/" className="btn btn-primary">
          Go to dashboard
        </Link>
      </EmptyState>
    </Card>
  );
}

export default NotFound;
