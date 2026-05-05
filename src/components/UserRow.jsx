import React from 'react';
import PropTypes from 'prop-types';
import { getAvatar } from './Avatar.jsx';

/**
 * Formats an ISO date string into a human-readable format.
 * @param {string} dateString - ISO date string.
 * @returns {string} Formatted date string.
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString || '';
  }
}

/**
 * Determines whether the given user can be deleted.
 * Hardcoded admin and the currently logged-in user cannot be deleted.
 * @param {Object} user - The user object to check.
 * @param {Object|null} currentUser - The currently logged-in user session.
 * @returns {boolean} True if the user can be deleted.
 */
function canDelete(user, currentUser) {
  if (user.username.toLowerCase() === 'admin') {
    return false;
  }
  if (currentUser && currentUser.username.toLowerCase() === user.username.toLowerCase()) {
    return false;
  }
  return true;
}

/**
 * User table row/card component for user management.
 * Displays avatar, display name, username, role badge pill, created date, and delete button.
 * Hardcoded admin and currently logged-in user cannot be deleted.
 * @param {{ user: Object, currentUser: Object|null, onDelete: Function }} props
 * @returns {JSX.Element}
 */
function UserRow({ user, currentUser, onDelete }) {
  const role = user.role || 'user';
  const showDelete = canDelete(user, currentUser);

  const roleBadgeClass =
    role === 'admin'
      ? 'bg-violet-100 text-violet-700'
      : 'bg-indigo-100 text-indigo-700';

  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg">
      <div className="flex items-center gap-3">
        {getAvatar(role)}
        <div>
          <p className="text-sm font-bold text-secondary-900">
            {user.displayName || user.username}
          </p>
          <p className="text-xs text-secondary-400">@{user.username}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass}`}
        >
          {role}
        </span>
        <span className="text-xs text-secondary-400">
          {formatDate(user.createdAt)}
        </span>
        {showDelete ? (
          <button
            type="button"
            onClick={() => onDelete(user)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-800"
            aria-label={`Delete user ${user.username}`}
          >
            Delete
          </button>
        ) : (
          <span className="inline-block w-16" />
        )}
      </div>
    </div>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    role: PropTypes.oneOf(['admin', 'user']),
    createdAt: PropTypes.string,
  }).isRequired,
  currentUser: PropTypes.shape({
    username: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
    displayName: PropTypes.string,
  }),
  onDelete: PropTypes.func.isRequired,
};

UserRow.defaultProps = {
  currentUser: null,
};

export default UserRow;