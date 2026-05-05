import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../utils/auth.js';
import { getAvatar } from './Avatar.jsx';

/**
 * Authenticated navigation bar component.
 * Displays role-based nav links (Admin: All Blogs, Write, Users; user: All Blogs, Write).
 * Shows avatar chip with role-based color and display name.
 * Logout dropdown clears session and redirects to landing page.
 * Mobile hamburger toggle via React state.
 * Active link visually highlighted.
 * @returns {JSX.Element}
 */
function Navbar() {
  const [session, setSession] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handleLogout() {
    clearSession();
    setSession(null);
    setDropdownOpen(false);
    navigate('/');
  }

  if (!session) {
    return null;
  }

  const isAdmin = session.role === 'admin';

  const navLinks = [
    { to: '/blogs', label: 'All Blogs' },
    { to: '/blog/new', label: 'Write' },
  ];

  if (isAdmin) {
    navLinks.push({ to: '/admin/users', label: 'Users' });
  }

  /**
   * Determines if a nav link is currently active.
   * @param {string} to - The link path.
   * @returns {boolean} True if the link matches the current location.
   */
  function isActive(to) {
    return location.pathname === to;
  }

  /**
   * Returns the appropriate class string for a nav link.
   * @param {string} to - The link path.
   * @returns {string} Tailwind class string.
   */
  function linkClass(to) {
    const base =
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors';
    if (isActive(to)) {
      return `${base} bg-primary-100 text-primary-700`;
    }
    return `${base} text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900`;
  }

  /**
   * Returns the appropriate class string for a mobile nav link.
   * @param {string} to - The link path.
   * @returns {string} Tailwind class string.
   */
  function mobileLinkClass(to) {
    const base =
      'block rounded-lg px-3 py-2 text-base font-medium transition-colors';
    if (isActive(to)) {
      return `${base} bg-primary-100 text-primary-700`;
    }
    return `${base} text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900`;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-secondary-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/blogs"
              className="text-xl font-bold text-secondary-900 transition-colors hover:text-primary-600"
            >
              ✍️ WriteSpace
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={linkClass(link.to)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="hidden items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary-100 md:flex"
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                {getAvatar(session.role || 'user')}
                <span className="text-sm font-medium text-secondary-700">
                  {session.displayName || session.username}
                </span>
                <svg
                  className={`h-4 w-4 text-secondary-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-secondary-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-secondary-100 px-4 py-2">
                    <p className="text-sm font-semibold text-secondary-900">
                      {session.displayName || session.username}
                    </p>
                    <p className="text-xs text-secondary-400">
                      @{session.username}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-secondary-600 transition-colors hover:bg-secondary-100 hover:text-secondary-900 md:hidden"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-secondary-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={mobileLinkClass(link.to)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-secondary-100 px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              {getAvatar(session.role || 'user')}
              <div>
                <p className="text-sm font-semibold text-secondary-900">
                  {session.displayName || session.username}
                </p>
                <p className="text-xs text-secondary-400">
                  @{session.username}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;