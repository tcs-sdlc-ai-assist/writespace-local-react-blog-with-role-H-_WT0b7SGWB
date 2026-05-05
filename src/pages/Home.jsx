import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import BlogCard from '../components/BlogCard.jsx';
import { getPosts } from '../utils/storage.js';
import { getSession } from '../utils/auth.js';

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
 * Authenticated blog list page component.
 * Displays all posts from localStorage in a responsive grid (1/2/3 columns).
 * Each post rendered as a BlogCard. Posts sorted newest first.
 * Edit icon visible to Admin on all posts, to user only on own posts.
 * Empty state message with CTA to write first post if no posts exist.
 * @returns {JSX.Element}
 */
function Home() {
  const [posts, setPosts] = useState([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);

    const allPosts = getPosts();
    const sorted = [...allPosts].sort(
      (a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)
    );
    setPosts(sorted);
  }, []);

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 sm:text-3xl">
              All Blogs
            </h1>
            <p className="mt-1 text-sm text-secondary-500">
              Discover stories from our community
            </p>
          </div>
          <Link
            to="/blog/new"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Write Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white py-20 shadow-md">
            <span className="mb-4 text-5xl" role="img" aria-label="No posts">
              📝
            </span>
            <h2 className="mb-2 text-xl font-bold text-secondary-900">
              No posts yet
            </h2>
            <p className="mb-6 text-sm text-secondary-500">
              Be the first to share your thoughts with the community!
            </p>
            <Link
              to="/blog/new"
              className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Write your first post
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                currentUser={session}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;