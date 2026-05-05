import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Navbar from '../components/Navbar.jsx';
import UserRow from '../components/UserRow.jsx';
import { getSession } from '../utils/auth.js';
import { getUsers, saveUsers } from '../utils/storage.js';

/**
 * Formats an ISO date string into a sortable timestamp.
 * @param {string} dateString - ISO date string.
 * @returns {number} Timestamp for sorting.
 */
function toTimestamp(dateString) {
  try {
    return new Date(dateString).getTime();
  } catch {
    return 0;
  }
}

/**
 * Admin-only user management page component.
 * Displays responsive table/cards of all users using UserRow component.
 * Create user form with display name, username, password, and role fields.
 * Validates all fields and username uniqueness.
 * Delete requires confirmation; hardcoded admin cannot be deleted; logged-in user cannot delete own account.
 * Non-admins redirected to /blogs via ProtectedRoute.
 * @returns {JSX.Element}
 */
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [session, setSession] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate('/login', { replace: true });
      return;
    }
    if (currentSession.role !== 'admin') {
      navigate('/blogs', { replace: true });
      return;
    }
    setSession(currentSession);

    const allUsers = getUsers();
    const sorted = [...allUsers].sort(
      (a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)
    );
    setUsers(sorted);
  }, [navigate]);

  /**
   * Returns the hardcoded admin user object for display purposes.
   * @returns {Object} The hardcoded admin user.
   */
  function getHardcodedAdmin() {
    return {
      id: 'hardcoded-admin',
      username: 'admin',
      displayName: 'Admin',
      role: 'admin',
      createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
    };
  }

  /**
   * Handles the create user form submission.
   * @param {React.FormEvent} e - The form submit event.
   */
  function handleCreateUser(e) {
    e.preventDefault();
    setFormError('');

    if (!displayName.trim() || !username.trim() || !password.trim()) {
      setFormError('All fields are required.');
      return;
    }

    if (password.length < 4) {
      setFormError('Password must be at least 4 characters.');
      return;
    }

    const trimmedUsername = username.trim().toLowerCase();

    if (trimmedUsername === 'admin') {
      setFormError('Username already exists.');
      return;
    }

    const existing = users.find(
      (u) => u.username.toLowerCase() === trimmedUsername
    );

    if (existing) {
      setFormError('Username already exists.');
      return;
    }

    setLoading(true);

    try {
      const now = new Date().toISOString();
      const newUser = {
        id: uuidv4(),
        username: username.trim(),
        displayName: displayName.trim(),
        password,
        role,
        createdAt: now,
      };

      const updatedUsers = [newUser, ...users];
      saveUsers(updatedUsers);
      setUsers(updatedUsers);

      setDisplayName('');
      setUsername('');
      setPassword('');
      setRole('user');
      setShowForm(false);
      setLoading(false);
    } catch (err) {
      console.error('Failed to create user:', err);
      setFormError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  /**
   * Handles delete button click on a user row. Shows confirmation dialog.
   * @param {Object} user - The user to delete.
   */
  function handleDeleteClick(user) {
    setDeleteUser(user);
    setShowConfirm(true);
  }

  /**
   * Handles confirmed deletion. Removes user from localStorage and updates state.
   */
  function handleConfirmDelete() {
    if (!deleteUser) {
      setShowConfirm(false);
      return;
    }

    const updatedUsers = users.filter((u) => u.id !== deleteUser.id);
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    setShowConfirm(false);
    setDeleteUser(null);
  }

  /**
   * Handles cancel of deletion. Hides confirmation dialog.
   */
  function handleCancelDelete() {
    setShowConfirm(false);
    setDeleteUser(null);
  }

  /**
   * Handles cancel of create user form. Resets form fields and hides form.
   */
  function handleCancelForm() {
    setDisplayName('');
    setUsername('');
    setPassword('');
    setRole('user');
    setFormError('');
    setShowForm(false);
  }

  const hardcodedAdmin = getHardcodedAdmin();
  const allDisplayUsers = [hardcodedAdmin, ...users];

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 sm:text-3xl">
              User Management
            </h1>
            <p className="mt-1 text-sm text-secondary-500">
              Manage all users on the platform
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            {showForm ? 'Cancel' : 'Create User'}
          </button>
        </div>

        {showForm && (
          <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-bold text-secondary-900">
              Create New User
            </h2>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="newDisplayName"
                    className="mb-1.5 block text-sm font-medium text-secondary-700"
                  >
                    Display Name
                  </label>
                  <input
                    id="newDisplayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name"
                    className="w-full rounded-lg border border-secondary-300 px-4 py-2.5 text-sm text-secondary-900 placeholder-secondary-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="newUsername"
                    className="mb-1.5 block text-sm font-medium text-secondary-700"
                  >
                    Username
                  </label>
                  <input
                    id="newUsername"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full rounded-lg border border-secondary-300 px-4 py-2.5 text-sm text-secondary-900 placeholder-secondary-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    autoComplete="off"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-1.5 block text-sm font-medium text-secondary-700"
                  >
                    Password
                  </label>
                  <input
                    id="newPassword"
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
                    htmlFor="newRole"
                    className="mb-1.5 block text-sm font-medium text-secondary-700"
                  >
                    Role
                  </label>
                  <select
                    id="newRole"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border border-secondary-300 px-4 py-2.5 text-sm text-secondary-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    disabled={loading}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  disabled={loading}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-100 hover:text-secondary-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-lg font-bold text-secondary-900">
            All Users ({allDisplayUsers.length})
          </h2>
        </div>

        {allDisplayUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-md">
            <span className="mb-4 text-5xl" role="img" aria-label="No users">
              👥
            </span>
            <h3 className="mb-2 text-xl font-bold text-secondary-900">
              No users yet
            </h3>
            <p className="text-sm text-secondary-500">
              Create the first user to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allDisplayUsers.map((user) => (
              <UserRow
                key={user.id || user.username}
                user={user}
                currentUser={session}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </main>

      {showConfirm && deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-bold text-secondary-900">
              Delete User
            </h2>
            <p className="mb-6 text-sm text-secondary-500">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-secondary-900">
                @{deleteUser.username}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="rounded-lg px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-100 hover:text-secondary-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;