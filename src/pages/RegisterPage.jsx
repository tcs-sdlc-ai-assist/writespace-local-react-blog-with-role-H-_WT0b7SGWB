import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession, register } from '../utils/auth.js';

/**
 * Registration page component.
 * Centered card UI with gradient background.
 * Display name, username, password, and confirm password fields with validation.
 * Username must be unique across localStorage users and hardcoded admin.
 * Successful registration saves user to localStorage via register(), writes session, and redirects to /blogs.
 * Already-authenticated users redirected to their home.
 * Link to login page.
 * @returns {JSX.Element}
 */
function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/blogs', { replace: true });
      }
    }
  }, [navigate]);

  /**
   * Handles form submission for registration.
   * @param {React.FormEvent} e - The form submit event.
   */
  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!displayName.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = register({
        username: username.trim(),
        displayName: displayName.trim(),
        password,
        confirmPassword,
      });

      if (result.status === 'error') {
        setError(result.error);
        setLoading(false);
        return;
      }

      navigate('/blogs', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 px-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white" />
        <div className="absolute left-1/2 top-1/3 h-48 w-48 rounded-full bg-white" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-block text-2xl font-bold text-secondary-900 transition-colors hover:text-primary-600"
          >
            ✍️ WriteSpace
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-secondary-900">
            Create an Account
          </h1>
          <p className="mt-2 text-sm text-secondary-500">
            Join WriteSpace and start sharing your stories
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="displayName"
              className="mb-1.5 block text-sm font-medium text-secondary-700"
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full rounded-lg border border-secondary-300 px-4 py-2.5 text-sm text-secondary-900 placeholder-secondary-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              autoComplete="name"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-sm font-medium text-secondary-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full rounded-lg border border-secondary-300 px-4 py-2.5 text-sm text-secondary-900 placeholder-secondary-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-secondary-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full rounded-lg border border-secondary-300 px-4 py-2.5 text-sm text-secondary-900 placeholder-secondary-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-secondary-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full rounded-lg border border-secondary-300 px-4 py-2.5 text-sm text-secondary-900 placeholder-secondary-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 transition-colors hover:text-primary-800"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;