import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound-code">404</div>
      <Compass size={42} />
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn btn--primary btn--md">Back to Dashboard</Link>
    </div>
  );
}
