import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const home = user ? `/${user.role}` : '/login';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl font-black text-gray-200 dark:text-gray-800 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <ArrowLeft size={16} /> Go Back
          </button>
          <Link to={home} className="btn-primary">
            <Home size={16} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
