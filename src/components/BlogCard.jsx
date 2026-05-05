import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getAvatar } from './Avatar.jsx';

const ACCENT_COLORS = [
  'border-blue-500',
  'border-green-500',
  'border-purple-500',
  'border-orange-500',
  'border-red-500',
  'border-indigo-500',
];

/**
 * Returns a consistent accent color class based on a string hash.
 * @param {string} id - The post id to derive a color from.
 * @returns {string} A Tailwind border color class.
 */
function getAccentColor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % ACCENT_COLORS.length;
  return ACCENT_COLORS[index];
}

/**
 * Truncates content to a given max length and appends ellipsis if needed.
 * @param {string} content - The full content string.
 * @param {number} [maxLength=150] - Maximum character length for the excerpt.
 * @returns {string} The truncated excerpt.
 */
function getExcerpt(content, maxLength = 150) {
  if (!content) {
    return '';
  }
  if (content.length <= maxLength) {
    return content;
  }
  return content.slice(0, maxLength).trimEnd() + '…';
}

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
 * Determines whether the current user can edit the given post.
 * @param {Object} post - The post object.
 * @param {Object|null} currentUser - The current user session object.
 * @returns {boolean} True if the user can edit the post.
 */
function canEdit(post, currentUser) {
  if (!currentUser) {
    return false;
  }
  if (currentUser.role === 'admin') {
    return true;
  }
  return currentUser.username === post.author;
}

/**
 * Reusable blog post card component.
 * Displays title, excerpt, date, author avatar, and colorful border accent.
 * Shows edit icon based on current user role/ownership.
 * Links to /blog/:id for reading.
 * @param {{ post: Object, currentUser: Object|null }} props
 * @returns {JSX.Element}
 */
function BlogCard({ post, currentUser }) {
  const accentColor = getAccentColor(post.id || '');
  const excerpt = getExcerpt(post.content);
  const authorRole = post.authorRole || 'user';
  const showEdit = canEdit(post, currentUser);

  return (
    <div
      className={`relative flex flex-col rounded-xl border-l-4 ${accentColor} bg-white p-6 shadow-md transition-shadow hover:shadow-lg`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getAvatar(authorRole)}
          <span className="text-sm font-medium text-secondary-700">
            {post.displayName || post.author || 'Anonymous'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {showEdit && (
            <Link
              to={`/blog/${post.id}/edit`}
              className="text-secondary-400 transition-colors hover:text-primary-600"
              aria-label="Edit post"
            >
              <span role="img" aria-label="Edit">✏️</span>
            </Link>
          )}
          <span className="text-xs text-secondary-400">
            {formatDate(post.createdAt)}
          </span>
        </div>
      </div>

      <Link to={`/blog/${post.id}`} className="group flex-1">
        <h3 className="mb-2 text-lg font-bold text-secondary-900 transition-colors group-hover:text-primary-600">
          {post.title}
        </h3>
        <p className="text-sm leading-relaxed text-secondary-500">
          {excerpt}
        </p>
      </Link>

      <div className="mt-4">
        <Link
          to={`/blog/${post.id}`}
          className="inline-flex items-center text-sm font-medium text-primary-600 transition-colors hover:text-primary-800"
        >
          Read more →
        </Link>
      </div>
    </div>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    author: PropTypes.string,
    authorRole: PropTypes.oneOf(['admin', 'user']),
    displayName: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  currentUser: PropTypes.shape({
    username: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
    displayName: PropTypes.string,
  }),
};

BlogCard.defaultProps = {
  currentUser: null,
};

export default BlogCard;