import React from 'react';
import PropTypes from 'prop-types';

/**
 * Returns a styled JSX span element with an emoji and role-based background color.
 * @param {'admin'|'user'} role - The user role.
 * @returns {JSX.Element} A styled span element representing the avatar.
 */
export function getAvatar(role) {
  const isAdmin = role === 'admin';
  const emoji = isAdmin ? '👑' : '📖';
  const bgClass = isAdmin
    ? 'bg-violet-100 text-violet-700'
    : 'bg-indigo-100 text-indigo-700';

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${bgClass}`}
      role="img"
      aria-label={isAdmin ? 'Admin avatar' : 'User avatar'}
    >
      {emoji}
    </span>
  );
}

/**
 * Avatar component that renders a role-based avatar.
 * @param {{ role: 'admin'|'user' }} props
 * @returns {JSX.Element}
 */
function Avatar({ role }) {
  return getAvatar(role);
}

Avatar.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']).isRequired,
};

export default Avatar;