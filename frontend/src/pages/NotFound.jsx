import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <div className="container empty-state">
        <h3>Page not found</h3>
        <p style={{ marginBottom: 18 }}>The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="btn btn-primary">
          Back to events
        </Link>
      </div>
    </div>
  );
}
