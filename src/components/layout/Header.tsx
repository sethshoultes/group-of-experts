import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, LogOut } from 'lucide-react';
import { signOut } from '../../lib/auth';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI Mastermind</h1>
          </Link>
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Profile
                </Link>
                <Link
                  to="/discussions"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Discussions
                </Link>
                <Link
                  to="/discussions/new"
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  New Discussion
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {loading ? 'Signing out...' : 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}