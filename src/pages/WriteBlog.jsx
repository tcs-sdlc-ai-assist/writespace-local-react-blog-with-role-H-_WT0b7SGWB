import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Navbar from '../components/Navbar.jsx';
import { getSession } from '../utils/auth.js';
import { getPosts, savePosts } from '../utils/storage.js';

/**
 * Blog create/edit form page component.
 * Create mode at '/blog/new' generates UUID, sets author info from session, saves to localStorage, redirects to /blog/:id.
 * Edit mode at '/blog/:id/edit' pre-fills form, updates record, redirects to post.
 * Ownership check: user can only edit own posts; Admin can edit any.
 * Title and content fields with validation, inline field-level errors, and character counter.
 * Cancel button routes back without saving.
 * @returns {JSX.Element}
 */
function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({ title: '', content: '' });
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  const TITLE_MAX = 150;
  const CONTENT_MAX = 5000;

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate('/login', { replace: true });
      return;
    }
    setSession(currentSession);

    if (isEditMode) {
      const posts = getPosts();
      const post = posts.find((p) => p.id === id);

      if (!post) {
        navigate('/blogs', { replace: true });
        return;
      }

      const canEdit =
        currentSession.role === 'admin' ||
        currentSession.username === post.author;

      if (!canEdit) {
        navigate('/blogs', { replace: true });
        return;
      }

      setTitle(post.title || '');
      setContent(post.content || '');
    }
  }, [id, isEditMode, navigate]);

  /**
   * Validates form fields and returns whether the form is valid.
   * @returns {boolean} True if the form is valid.
   */
  function validate() {
    const newErrors = { title: '', content: '' };
    let valid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required.';
      valid = false;
    } else if (title.trim().length > TITLE_MAX) {
      newErrors.title = `Title must be ${TITLE_MAX} characters or less.`;
      valid = false;
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required.';
      valid = false;
    } else if (content.trim().length > CONTENT_MAX) {
      newErrors.content = `Content must be ${CONTENT_MAX} characters or less.`;
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  /**
   * Handles form submission for creating or updating a blog post.
   * @param {React.FormEvent} e - The form submit event.
   */
  function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const posts = getPosts();

      if (isEditMode) {
        const postIndex = posts.findIndex((p) => p.id === id);

        if (postIndex === -1) {
          setSubmitError('Post not found. It may have been deleted.');
          setLoading(false);
          return;
        }

        const updatedPost = {
          ...posts[postIndex],
          title: title.trim(),
          content: content.trim(),
          updatedAt: new Date().toISOString(),
        };

        const updatedPosts = [...posts];
        updatedPosts[postIndex] = updatedPost;
        savePosts(updatedPosts);

        navigate(`/blog/${id}`, { replace: true });
      } else {
        const newId = uuidv4();
        const now = new Date().toISOString();

        const newPost = {
          id: newId,
          title: title.trim(),
          content: content.trim(),
          author: session.username,
          authorRole: session.role,
          displayName: session.displayName || session.username,
          createdAt: now,
          updatedAt: now,
        };

        savePosts([...posts, newPost]);

        navigate(`/blog/${newId}`, { replace: true });
      }
    } catch (err) {
      console.error('Failed to save post:', err);
      setSubmitError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  /**
   * Handles cancel button click. Navigates back without saving.
   */
  function handleCancel() {
    if (isEditMode) {
      navigate(`/blog/${id}`);
    } else {
      navigate('/blogs');
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900 sm:text-3xl">
            {isEditMode ? 'Edit Post' : 'Write a New Post'}
          </h1>
          <p className="mt-1 text-sm text-secondary-500">
            {isEditMode
              ? 'Update your blog post below'
              : 'Share your thoughts with the community'}
          </p>
        </div>

        {submitError && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-6">
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-secondary-700"
                >
                  Title
                </label>
                <span
                  className={`text-xs ${
                    title.length > TITLE_MAX
                      ? 'text-red-500'
                      : 'text-secondary-400'
                  }`}
                >
                  {title.length}/{TITLE_MAX}
                </span>
              </div>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors((prev) => ({ ...prev, title: '' }));
                  }
                }}
                placeholder="Enter your post title"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-secondary-900 placeholder-secondary-400 transition-colors focus:outline-none focus:ring-2 ${
                  errors.title
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500/20'
                }`}
                disabled={loading}
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-secondary-700"
                >
                  Content
                </label>
                <span
                  className={`text-xs ${
                    content.length > CONTENT_MAX
                      ? 'text-red-500'
                      : 'text-secondary-400'
                  }`}
                >
                  {content.length}/{CONTENT_MAX}
                </span>
              </div>
              <textarea
                id="content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) {
                    setErrors((prev) => ({ ...prev, content: '' }));
                  }
                }}
                placeholder="Write your blog post content here..."
                rows={12}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-secondary-900 placeholder-secondary-400 transition-colors focus:outline-none focus:ring-2 ${
                  errors.content
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500/20'
                }`}
                disabled={loading}
              />
              {errors.content && (
                <p className="mt-1.5 text-xs text-red-500">{errors.content}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
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
              {loading
                ? isEditMode
                  ? 'Saving…'
                  : 'Publishing…'
                : isEditMode
                  ? 'Save Changes'
                  : 'Publish Post'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default WriteBlog;