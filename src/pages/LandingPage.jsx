import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';
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
 * Public landing page component.
 * Hero section with gradient background, app name, tagline, and CTA buttons.
 * Features section with three cards describing platform capabilities.
 * Latest posts preview showing up to 3 recent posts from localStorage.
 * Footer with links and copyright.
 * @returns {JSX.Element}
 */
function LandingPage() {
  const [latestPosts, setLatestPosts] = useState([]);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);

    const posts = getPosts();
    const sorted = [...posts].sort(
      (a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)
    );
    setLatestPosts(sorted.slice(0, 3));
  }, []);

  const features = [
    {
      icon: '✍️',
      title: 'Write & Publish',
      description:
        'Create beautiful blog posts with an intuitive editor. Share your thoughts with the world in just a few clicks.',
    },
    {
      icon: '👥',
      title: 'Community Driven',
      description:
        'Join a growing community of writers and readers. Discover new perspectives and connect with like-minded people.',
    },
    {
      icon: '🔒',
      title: 'Role-Based Access',
      description:
        'Admins manage users and content. Writers focus on creating. Everyone gets the right tools for their role.',
    },
  ];

  /**
   * Handles click on a post card when user is not authenticated.
   * Redirects to login page.
   * @param {React.MouseEvent} e - The click event.
   */
  function handleUnauthenticatedPostClick(e) {
    if (!session) {
      e.preventDefault();
      navigate('/login');
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white" />
          <div className="absolute left-1/2 top-1/3 h-48 w-48 rounded-full bg-white" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Welcome to{' '}
              <span className="text-primary-200">WriteSpace</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-100 sm:text-xl">
              A modern blogging platform where ideas come to life. Write,
              share, and discover stories that matter.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              {session ? (
                <Link
                  to="/blogs"
                  className="rounded-xl bg-white px-8 py-3 text-base font-semibold text-primary-700 shadow-lg transition-all hover:bg-primary-50 hover:shadow-xl"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="rounded-xl bg-white px-8 py-3 text-base font-semibold text-primary-700 shadow-lg transition-all hover:bg-primary-50 hover:shadow-xl"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-xl border-2 border-white/30 bg-white/10 px-8 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-secondary-900 sm:text-4xl">
            Why WriteSpace?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary-500">
            Everything you need to start your writing journey, all in one
            place.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl bg-white p-8 shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 text-4xl">
                <span role="img" aria-label={feature.title}>
                  {feature.icon}
                </span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-secondary-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-secondary-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Posts Section */}
      {latestPosts.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-secondary-900 sm:text-4xl">
                Latest Posts
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary-500">
                Check out what our community has been writing about.
              </p>
            </div>
            <div
              className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              onClick={handleUnauthenticatedPostClick}
            >
              {latestPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  currentUser={session}
                />
              ))}
            </div>
            <div className="mt-10 text-center">
              {session ? (
                <Link
                  to="/blogs"
                  className="inline-flex items-center text-base font-medium text-primary-600 transition-colors hover:text-primary-800"
                >
                  View all posts →
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center text-base font-medium text-primary-600 transition-colors hover:text-primary-800"
                >
                  Sign in to read more →
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-secondary-200 bg-secondary-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-secondary-900">
                ✍️ WriteSpace
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="text-sm text-secondary-500 transition-colors hover:text-secondary-900"
              >
                Home
              </Link>
              <Link
                to="/login"
                className="text-sm text-secondary-500 transition-colors hover:text-secondary-900"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm text-secondary-500 transition-colors hover:text-secondary-900"
              >
                Register
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-secondary-200 pt-6 text-center">
            <p className="text-sm text-secondary-400">
              © {new Date().getFullYear()} WriteSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;