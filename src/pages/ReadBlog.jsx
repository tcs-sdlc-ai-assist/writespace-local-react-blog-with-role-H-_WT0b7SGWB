import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getAvatar } from '../components/Avatar.jsx';
import { getSession } from '../utils/auth.js';
import { getPosts, savePosts } from '../utils/storage.js';

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
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString || '';
  }
}

/**
 * Determines whether the current user can edit/delete the given post.
 * @param {Object} post - The post object.
 * @param {Object|null} currentUser - The current user session object.
 * @returns {boolean} True if the user can edit/delete the post.
 */
function canModify(post, currentUser) {
  if (!currentUser) {
    return false;
  }
  if (currentUser.role === 'admin') {
    return true;
  }
  return currentUser.username === post.author;
}

/**
 * Full blog post reading view page component.
 * Displays title, author avatar, formatted date, and full content.
 * Admin sees edit and delete buttons on all posts; user sees them only on own posts.
 * Delete requires confirmation dialog and removes post from localStorage.
 * Invalid/missing ID shows 'Post not found' message with back link to /blogs.
 * @returns {JSX.Element}
 */
function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [session, setSession] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);

    const posts = getPosts();
    const found = posts.find((p) => p.id === id);

    if (!found) {
      setNotFound(true);
      return;
    }

    setPost(found);
  }, [id]);

  /**
   * Handles delete button click. Shows confirmation dialog.
   */
  function handleDeleteClick() {
    setShowConfirm(true);
  }

  /**
   * Handles confirmed deletion. Removes post from localStorage and redirects to /blogs.
   */
  function handleConfirmDelete() {
    const posts = getPosts();
    const updatedPosts = posts.filter((p) => p.id !== id);
    savePosts(updatedPosts);
    navigate('/blogs', { replace: true });
  }

  /**
   * Handles cancel of deletion. Hides confirmation dialog.
   */
  function handleCancelDelete() {
    setShowConfirm(false);
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center rounded-xl bg-white py-20 shadow-md">
            <span className="mb-4 text-5xl" role="img" aria-label="Not found">
              🔍
            </span>
            <h2 className="mb-2 text-xl font-bold text-secondary-900">
              Post not found
            </h2>
            <p className="mb-6 text-sm text-secondary-500">
              The post you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              to="/blogs"
              className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Back to All Blogs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-secondary-500">Loading…</p>
          </div>
        </main>
      </div>
    );
  }

  const authorRole = post.authorRole || 'user';
  const showActions = canModify(post, session);

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/blogs"
            className="inline-flex items-center text-sm font-medium text-secondary-500 transition-colors hover:text-secondary-900"
          >
            ← Back to All Blogs
          </Link>
        </div>

        <article className="rounded-xl bg-white p-6 shadow-md sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getAvatar(authorRole)}
              <div>
                <p className="text-sm font-bold text-secondary-900">
                  {post.displayName || post.author || 'Anonymous'}
                </p>
                <p className="text-xs text-secondary-400">
                  {formatDate(post.createdAt)}
                  {post.updatedAt && post.updatedAt !== post.createdAt && (
                    <span> · Edited {formatDate(post.updatedAt)}</span>
                  )}
                </p>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/blog/${post.id}/edit`}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-800"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <h1 className="mb-6 text-2xl font-bold text-secondary-900 sm:text-3xl">
            {post.title}
          </h1>

          <div className="prose max-w-none text-sm leading-relaxed text-secondary-700 whitespace-pre-wrap">
            {post.content}
          </div>
        </article>
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

export default ReadBlog;