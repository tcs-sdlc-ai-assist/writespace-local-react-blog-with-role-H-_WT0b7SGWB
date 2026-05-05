# WriteSpace

A modern blogging platform built with React where ideas come to life. Write, share, and discover stories that matter.

## Tech Stack

- **React 18** — UI library with functional components and hooks
- **Vite 5** — Fast build tool and development server
- **Tailwind CSS 3** — Utility-first CSS framework
- **React Router v6** — Client-side routing with protected routes
- **localStorage** — Client-side data persistence for posts, users, and sessions
- **Vitest** — Unit testing framework with jsdom environment
- **PropTypes** — Runtime prop type checking for React components

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The development server starts at [http://localhost:3000](http://localhost:3000) and opens automatically in your default browser.

### Build

```bash
npm run build
```

Outputs production-ready files to the `dist/` directory with source maps enabled.

### Preview Production Build

```bash
npm run preview
```

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## Folder Structure

```
writespace/
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── vitest.config.js            # Vitest configuration
├── tailwind.config.js          # Tailwind CSS configuration with custom colors
├── postcss.config.js           # PostCSS configuration
├── vercel.json                 # Vercel SPA deployment config
├── public/
│   └── vite.svg                # Favicon
└── src/
    ├── main.jsx                # React DOM entry point
    ├── App.jsx                 # Root component with route definitions
    ├── index.css               # Tailwind CSS directives
    ├── setupTests.js           # Test setup file
    ├── components/
    │   ├── Avatar.jsx          # Role-based avatar component (👑 admin / 📖 user)
    │   ├── Avatar.test.jsx     # Avatar unit tests
    │   ├── BlogCard.jsx        # Blog post card with accent color, excerpt, and edit controls
    │   ├── Navbar.jsx          # Authenticated navigation bar with mobile menu and user dropdown
    │   ├── ProtectedRoute.jsx  # Route guard for authentication and role-based access
    │   ├── ProtectedRoute.test.jsx # ProtectedRoute unit tests
    │   ├── PublicNavbar.jsx    # Guest navigation bar for landing page
    │   ├── StatCard.jsx        # Gradient stat card for admin dashboard
    │   └── UserRow.jsx         # User list row for user management
    ├── pages/
    │   ├── AdminDashboard.jsx  # Admin dashboard with stats, quick actions, and recent posts
    │   ├── Home.jsx            # Blog listing page with responsive grid
    │   ├── LandingPage.jsx     # Public landing page with hero, features, and latest posts
    │   ├── LoginPage.jsx       # Login form with validation
    │   ├── ReadBlog.jsx        # Full blog post reading view with edit/delete controls
    │   ├── RegisterPage.jsx    # Registration form with validation
    │   ├── UserManagement.jsx  # Admin user management with create/delete functionality
    │   └── WriteBlog.jsx       # Blog create/edit form with character counters
    └── utils/
        ├── auth.js             # Session management, login, and registration logic
        ├── auth.test.js        # Auth utility unit tests
        ├── storage.js          # localStorage CRUD for posts and users
        └── storage.test.js     # Storage utility unit tests
```

## Route Map

| Path             | Access          | Component          | Description                          |
| ---------------- | --------------- | ------------------ | ------------------------------------ |
| `/`              | Public          | LandingPage        | Hero section, features, latest posts |
| `/login`         | Public          | LoginPage          | User login form                      |
| `/register`      | Public          | RegisterPage       | User registration form               |
| `/blogs`         | Authenticated   | Home               | All blog posts in a responsive grid  |
| `/blog/new`      | Authenticated   | WriteBlog          | Create a new blog post               |
| `/blog/:id`      | Authenticated   | ReadBlog           | Read a full blog post                |
| `/blog/:id/edit` | Authenticated   | WriteBlog          | Edit an existing blog post           |
| `/admin`         | Admin only      | AdminDashboard     | Platform overview and quick actions  |
| `/admin/users`   | Admin only      | UserManagement     | Create, view, and delete users       |

## Roles

### Admin

- Default credentials: `admin` / `admin123`
- Access to the admin dashboard with platform statistics
- Manage all users (create and delete)
- Edit and delete any blog post
- Write and publish blog posts
- Crown emoji avatar (👑) with violet background

### User

- Register via the registration page
- Write and publish blog posts
- Edit and delete own blog posts only
- Book emoji avatar (📖) with indigo background

## Usage Guide

### First-Time Setup

1. Run `npm install` to install dependencies.
2. Run `npm run dev` to start the development server.
3. Visit [http://localhost:3000](http://localhost:3000) in your browser.
4. Log in with the default admin account (`admin` / `admin123`) or register a new user account.

### Writing a Blog Post

1. Log in and click **Write Post** or navigate to `/blog/new`.
2. Enter a title (up to 150 characters) and content (up to 5,000 characters).
3. Click **Publish Post** to save and view your new post.

### Managing Users (Admin)

1. Log in as admin and navigate to **Users** in the navigation bar.
2. Click **Create User** to add a new user with a display name, username, password, and role.
3. Delete users by clicking the **Delete** button on their row (the hardcoded admin and your own account cannot be deleted).

### Data Persistence

All data is stored in the browser's localStorage under the following keys:

| Key          | Description                  |
| ------------ | ---------------------------- |
| `ws_posts`   | Array of blog post objects   |
| `ws_users`   | Array of registered users    |
| `ws_session` | Current authenticated session |

Clearing your browser's localStorage will reset all application data.

## Deployment

### Vercel

The project includes a `vercel.json` configuration that rewrites all routes to `index.html` for SPA client-side routing support. To deploy:

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Vercel auto-detects Vite and uses the correct build settings.
4. The app is deployed with the SPA rewrite rule active.

### Other Platforms

For any static hosting platform, ensure:

- The build command is `npm run build`.
- The output directory is `dist`.
- All routes are rewritten to `index.html` to support client-side routing.

## License

Private