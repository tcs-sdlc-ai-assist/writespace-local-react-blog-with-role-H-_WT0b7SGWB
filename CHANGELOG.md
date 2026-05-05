# Changelog

All notable changes to the WriteSpace project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added

- **Public Landing Page**
  - Hero section with gradient background, app name, tagline, and call-to-action buttons.
  - Features section with three cards describing platform capabilities (Write & Publish, Community Driven, Role-Based Access).
  - Latest posts preview showing up to 3 recent posts from localStorage.
  - Footer with navigation links and copyright notice.
  - Public navbar with Login and Get Started buttons for unauthenticated users, or avatar chip and Go to Dashboard button for authenticated users.

- **Authentication**
  - Login page with centered card UI, gradient background, username and password fields with validation.
  - Registration page with display name, username, password, and confirm password fields with validation.
  - Hardcoded admin credentials (`admin` / `admin123`) checked before localStorage users.
  - Session management via localStorage (`ws_session` key) with `getSession`, `setSession`, and `clearSession` utilities.
  - Case-insensitive username matching for login and registration.
  - Username uniqueness validation across hardcoded admin and localStorage users.
  - Password minimum length validation (4 characters).
  - Already-authenticated users redirected to their respective home page (admin → `/admin`, user → `/blogs`).

- **Role-Based Access Control**
  - `ProtectedRoute` component guarding authenticated routes.
  - Unauthenticated users redirected to `/login`.
  - Admin-only routes (`/admin`, `/admin/users`) restricted via `role="admin"` prop; non-admin users redirected to `/blogs`.
  - Role-based avatar display: crown emoji (👑) with violet background for admins, book emoji (📖) with indigo background for users.

- **Blog CRUD**
  - Blog listing page (`/blogs`) displaying all posts in a responsive grid (1/2/3 columns) sorted newest first.
  - Blog card component with title, excerpt (truncated to 150 characters), author avatar, formatted date, and colorful left border accent derived from post ID hash.
  - Blog reading page (`/blog/:id`) with full post content, author info, formatted dates, and edit/delete controls.
  - Blog creation page (`/blog/new`) with title and content fields, character counters (title: 150, content: 5000), inline field-level validation errors, and UUID generation.
  - Blog editing page (`/blog/:id/edit`) pre-filling form with existing post data, ownership check (user can only edit own posts, admin can edit any).
  - Delete confirmation dialog for posts with cancel and confirm actions.
  - Empty state messaging with call-to-action to write first post.

- **Admin Dashboard**
  - Gradient banner header with welcome message.
  - Four stat cards displaying total posts, total users, admin count, and user count.
  - Quick action buttons for writing new posts and managing users.
  - Recent posts section showing up to 5 latest posts with edit and delete controls.
  - Delete confirmation dialog for posts.

- **User Management**
  - Admin-only user management page (`/admin/users`) with responsive user list.
  - User row component displaying avatar, display name, username, role badge pill, created date, and delete button.
  - Create user form with display name, username, password, and role (user/admin) fields.
  - Username uniqueness validation for new user creation.
  - Delete confirmation dialog for users.
  - Protection against deleting the hardcoded admin account or the currently logged-in user.
  - Hardcoded admin displayed at the top of the user list.

- **localStorage Persistence**
  - Posts stored under `ws_posts` key with `getPosts` and `savePosts` utilities.
  - Users stored under `ws_users` key with `getUsers` and `saveUsers` utilities.
  - Graceful error handling for localStorage read/write failures.
  - JSON parse error handling with fallback to empty arrays.

- **Responsive Tailwind CSS UI**
  - Custom color palette with `primary` (sky blue) and `secondary` (slate) color scales.
  - Sticky navigation bar with backdrop blur effect.
  - Mobile hamburger menu toggle for authenticated navbar.
  - User dropdown menu with avatar, display name, username, and logout action.
  - Click-outside detection to close dropdown menus.
  - Responsive grid layouts adapting from 1 to 3 columns.
  - Gradient backgrounds, rounded cards, shadow effects, and hover transitions throughout.
  - Active link highlighting in navigation.

- **Vercel SPA Deployment**
  - `vercel.json` configured with SPA rewrite rule directing all routes to `index.html`.
  - Vite build configuration with source maps and `dist` output directory.

- **Testing**
  - Unit tests for `storage.js` utilities covering happy paths, error handling, and edge cases.
  - Unit tests for `auth.js` covering session management, login, and registration flows.
  - Unit tests for `ProtectedRoute` component covering authentication and authorization redirects.
  - Unit tests for `Avatar` component covering role-based rendering.
  - Vitest configuration with jsdom environment and v8 coverage provider.