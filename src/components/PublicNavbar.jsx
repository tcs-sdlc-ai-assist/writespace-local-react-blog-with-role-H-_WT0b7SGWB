import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSession } from '../utils/auth.js';
import { getAvatar } from './Avatar.jsx';

/**
 * Guest navigation bar component.
 * Shows 'WriteSpace' logo/brand, Login button, and Get Started button for unauthenticated users.
 * If user is logged in (session exists), shows avatar chip and 'Go to Dashboard' button instead.
 * @returns {JSX.Element}
 */
function PublicNavbar() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-secondary-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-xl font-bold text-secondary-900 transition-colors hover:text-primary-600"
        >
          ✍️ WriteSpace
        </Link>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <div className="flex items-center gap-2">
                {getAvatar(session.role || 'user')}
                <span className="hidden text-sm font-medium text-secondary-700 sm:inline">
                  {session.displayName || session.username}
                </span>
              </div>
              <Link
                to="/blogs"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
              >
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-100 hover:text-secondary-900"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default PublicNavbar;