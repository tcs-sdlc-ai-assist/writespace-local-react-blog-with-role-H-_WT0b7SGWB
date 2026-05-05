import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import StatCard from '../components/StatCard.jsx';
import { getAvatar } from '../components/Avatar.jsx';
import { getSession } from '../utils/auth.js';
import { getPosts, savePosts, getUsers } from '../utils/storage.js';

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
 * Truncates content to a given max length and appends ellipsis if needed.
 * @param {string} content - The full content string.
 * @param {number} [maxLength=80] - Maximum character length for the excerpt.
 * @returns {string} The truncated excerpt.
 */
function getExcerpt(content, maxLength = 80) {
  if (!content) {
    return '';
  }
  if (content.length <= maxLength) {
    return content;
  }
  return content.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Admin-only dashboard page component.
 * Displays gradient banner header, four stat cards, quick-action buttons,
 * and recent posts section with edit/delete controls.
 * Non-admins are redirected to /blogs via ProtectedRoute wrapper.
 * @returns {JSX.Element}
 */
function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [session, setSession] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);
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

    const allPosts = getPosts();
    const sorted = [...allPosts].sort(
      (a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)
    );
    setPosts(sorted);

    const allUsers = getUsers();
    setUsers(allUsers);
  }, [navigate]);

  const totalPosts = posts.length;
  const totalUsers = users.length + 1; // +1 for hardcoded admin
  const adminCount = users.filter((u) => u.role === 'admin').length + 1; // +1 for hardcoded admin
  const userCount = users.filter((u) => u.role === 'user').length;
  const recentPosts = posts.slice(0, 5);

  /**
   * Handles delete button click. Shows confirmation dialog.
   * @param {string} postId - The ID of the post to delete.
   */
  function handleDeleteClick(postId) {
    setDeletePostId(postId);
    setShowConfirm(true);
  }

  /**
   * Handles confirmed deletion. Removes post from localStorage and updates state.
   */
  function handleConfirmDelete() {
    const updatedPosts = posts.filter((p) => p.id !== deletePostId);
    savePosts(updatedPosts);
    setPosts(updatedPosts);
    setShowConfirm(false);
    setDeletePostId(null);
  }

  /**
   * Handles cancel of deletion. Hides confirmation dialog.
   */
  function handleCancelDelete() {
    setShowConfirm(false);
    setDeletePostId(null);
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Gradient Banner Header */}
        <div className="mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 p-8 text-white shadow-lg">
          <div className="relative">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
            <div className="relative">
              <h1 className="text-2xl font-bold sm:text-3xl">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-sm text-primary-100">
                Welcome back, {session?.displayName || session?.username || 'Admin'}! Here&apos;s an overview of your platform.
              </p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Posts"
            value={totalPosts}
            icon="📝"
            color="blue"
          />
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon="👥"
            color="green"
          />
          <StatCard
            title="Admins"
            value={adminCount}
            icon="👑"
            color="purple"
          />
          <StatCard
            title="Users"
            value={userCount}
            icon="📖"
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-secondary-900">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/blog/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              <span role="img" aria-label="Write">✍️</span>
              Write New Post
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 rounded-lg bg-secondary-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-secondary-800"
            >
              <span role="img" aria-label="Users">👥</span>
              Manage Users
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-secondary-900">
              Recent Posts
            </h2>
            <Link
              to="/blogs"
              className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-800"
            >
              View all →
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-md">
              <span className="mb-4 text-5xl" role="img" aria-label="No posts">
                📝
              </span>
              <h3 className="mb-2 text-xl font-bold text-secondary-900">
                No posts yet
              </h3>
              <p className="mb-6 text-sm text-secondary-500">
                Get started by creating the first post!
              </p>
              <Link
                to="/blog/new"
                className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Write your first post
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => {
                const authorRole = post.authorRole || 'user';

                return (
                  <div
                    key={post.id}
                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {getAvatar(authorRole)}
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/blog/${post.id}`}
                          className="block truncate text-sm font-bold text-secondary-900 transition-colors hover:text-primary-600"
                        >
                          {post.title}
                        </Link>
                        <p className="truncate text-xs text-secondary-400">
                          {post.displayName || post.author || 'Anonymous'} · {formatDate(post.createdAt)}
                        </p>
                        <p className="mt-1 truncate text-xs text-secondary-500">
                          {getExcerpt(post.content)}
                        </p>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center gap-2 flex-shrink-0">
                      <Link
                        to={`/blog/${post.id}/edit`}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-800"
                        aria-label={`Edit post ${post.title}`}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(post.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-800"
                        aria-label={`Delete post ${post.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-bold text-secondary-900">
              Delete Post
            </h2>
            <p className="mb-6 text-sm text-secondary-500">
              Are you sure you want to delete this post? This action cannot be undone.
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

export default AdminDashboard;