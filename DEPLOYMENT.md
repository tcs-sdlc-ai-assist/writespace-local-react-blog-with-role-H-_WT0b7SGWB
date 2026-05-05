# Deployment Guide

This document covers deploying the WriteSpace application to production environments.

## Table of Contents

- [Overview](#overview)
- [Build Configuration](#build-configuration)
- [Vercel Deployment](#vercel-deployment)
- [SPA Rewrite Configuration](#spa-rewrite-configuration)
- [Environment Variables](#environment-variables)
- [CI/CD Auto-Deploy](#cicd-auto-deploy)
- [Other Hosting Platforms](#other-hosting-platforms)
- [Troubleshooting](#troubleshooting)

## Overview

WriteSpace is a static single-page application (SPA) built with Vite and React. It compiles to static HTML, CSS, and JavaScript files that can be served from any static hosting provider. All data is persisted in the browser's `localStorage`, so no backend server or database is required.

## Build Configuration

### Build Command

```bash
npm run build
```

This runs `vite build` under the hood, which:

- Bundles all React components and dependencies into optimized chunks.
- Generates source maps for debugging.
- Outputs all files to the `dist/` directory.

### Output Directory

```
dist/
```

The `dist` directory contains the production-ready static files:

```
dist/
├── index.html          # Entry HTML file
├── vite.svg            # Favicon
└── assets/
    ├── index-[hash].js   # Bundled JavaScript
    └── index-[hash].css  # Bundled CSS (Tailwind)
```

### Preview Production Build Locally

To verify the production build before deploying:

```bash
npm run build
npm run preview
```

The preview server starts and serves the `dist` directory, simulating a production environment.

## Vercel Deployment

### Step-by-Step

1. **Push your repository to GitHub** (or GitLab / Bitbucket).

2. **Import the project in Vercel:**
   - Go to [https://vercel.com](https://vercel.com) and sign in.
   - Click **Add New → Project**.
   - Select your WriteSpace repository from the list.

3. **Configure build settings:**
   Vercel auto-detects Vite projects and applies the correct defaults. Verify the following settings:

   | Setting          | Value           |
   | ---------------- | --------------- |
   | Framework Preset | Vite            |
   | Build Command    | `npm run build` |
   | Output Directory | `dist`          |
   | Install Command  | `npm install`   |

4. **Deploy:**
   - Click **Deploy**.
   - Vercel installs dependencies, runs the build, and publishes the `dist` directory.
   - A unique URL is assigned to your deployment (e.g., `https://writespace-xxxx.vercel.app`).

5. **Verify:**
   - Visit the deployment URL.
   - Navigate to different routes (e.g., `/login`, `/register`, `/blogs`) and confirm they load correctly.
   - Refresh the page on a nested route to confirm the SPA rewrite is working.

### Custom Domain (Optional)

1. In the Vercel dashboard, go to your project **Settings → Domains**.
2. Add your custom domain and follow the DNS configuration instructions.
3. Vercel automatically provisions an SSL certificate.

## SPA Rewrite Configuration

WriteSpace uses client-side routing via React Router v6. All routes (e.g., `/blogs`, `/blog/new`, `/admin`) are handled in the browser by JavaScript. When a user refreshes the page or navigates directly to a nested route, the server must return `index.html` so React Router can handle the route.

The `vercel.json` file in the project root configures this rewrite:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**How it works:**

- Any request to the server (e.g., `GET /blogs`, `GET /blog/abc-123`) is rewritten to serve `index.html`.
- Static assets in the `dist/assets/` directory are served directly because Vercel serves existing files before applying rewrites.
- React Router then reads the URL and renders the correct page component.

**Important:** Do not remove or modify `vercel.json` unless you understand the impact on client-side routing. Without this rewrite rule, refreshing on any route other than `/` will return a 404 error.

## Environment Variables

WriteSpace does **not** require any environment variables. All configuration is embedded in the source code:

- **Authentication:** Hardcoded admin credentials (`admin` / `admin123`) are defined in `src/utils/auth.js`.
- **Data persistence:** All data is stored in the browser's `localStorage` under the keys `ws_posts`, `ws_users`, and `ws_session`.
- **API calls:** The application makes no external API calls.

No `.env` file is needed for development or production. If you extend the application with external services in the future, use Vite's environment variable convention:

```bash
# .env.local (not committed to version control)
VITE_API_URL=https://api.example.com
```

Access in code via `import.meta.env.VITE_API_URL`.

## CI/CD Auto-Deploy

### Vercel Auto-Deploy on Push

When your repository is connected to Vercel, deployments are triggered automatically:

| Event                          | Deployment Type | URL                                      |
| ------------------------------ | --------------- | ---------------------------------------- |
| Push to `main` (or `master`)   | Production      | Your production URL / custom domain      |
| Push to any other branch       | Preview         | Unique preview URL per commit            |
| Pull request opened / updated  | Preview         | Unique preview URL linked to the PR      |

**No additional CI/CD configuration is required.** Vercel handles:

- Installing dependencies (`npm install`)
- Running the build (`npm run build`)
- Deploying the `dist` output
- Assigning preview or production URLs

### Running Tests in CI

To run tests before deployment, you can add a GitHub Actions workflow or use Vercel's build command override:

#### Option A: Override Build Command in Vercel

In the Vercel dashboard under **Settings → General → Build & Development Settings**, set the build command to:

```bash
npm test && npm run build
```

This runs the test suite before building. If any test fails, the build is aborted and the deployment does not proceed.

#### Option B: GitHub Actions Workflow

Create `.github/workflows/ci.yml` in your repository:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
```

This ensures tests pass on every push and pull request. Vercel still handles the actual deployment independently.

## Other Hosting Platforms

WriteSpace can be deployed to any static hosting provider. The key requirements are:

| Requirement      | Value           |
| ---------------- | --------------- |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| SPA Rewrite      | All routes → `index.html` |
| Node.js Version  | 18+             |

### Netlify

1. Connect your repository in the Netlify dashboard.
2. Set build command to `npm run build` and publish directory to `dist`.
3. Create a `netlify.toml` file (or use the `_redirects` file):

   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

   Or create `public/_redirects`:

   ```
   /*    /index.html   200
   ```

### GitHub Pages

1. Run `npm run build`.
2. Deploy the `dist` directory using the `gh-pages` package or GitHub Actions.
3. Add a `404.html` file that is a copy of `index.html` to handle SPA routing.

### Cloudflare Pages

1. Connect your repository in the Cloudflare Pages dashboard.
2. Set build command to `npm run build` and output directory to `dist`.
3. Cloudflare Pages automatically handles SPA routing for single-page applications.

### Docker / Static Server

Serve the `dist` directory with any static file server. Example using `serve`:

```bash
npm run build
npx serve dist -s -l 3000
```

The `-s` flag enables SPA mode, which rewrites all routes to `index.html`.

## Troubleshooting

### 404 on Page Refresh

**Cause:** The hosting provider is not configured to rewrite all routes to `index.html`.

**Fix:** Ensure the SPA rewrite rule is in place. For Vercel, verify that `vercel.json` exists in the project root with the rewrite configuration shown above.

### Blank Page After Deployment

**Cause:** The base URL may be misconfigured if deploying to a subdirectory.

**Fix:** If deploying to a subdirectory (e.g., `https://example.com/writespace/`), add a `base` option to `vite.config.js`:

```js
export default defineConfig({
  base: '/writespace/',
  // ...
});
```

For root-level deployments (e.g., `https://writespace.vercel.app`), no `base` configuration is needed.

### Styles Missing After Build

**Cause:** Tailwind CSS may not be processing all component files.

**Fix:** Verify that `tailwind.config.js` includes all source paths in the `content` array:

```js
content: [
  './index.html',
  './src/**/*.{js,jsx}',
],
```

### localStorage Data Not Persisting

**Cause:** `localStorage` is scoped to the origin (protocol + domain + port). Data stored on `localhost:3000` is not available on your production domain.

**Fix:** This is expected behavior. Each deployment domain has its own isolated `localStorage`. Users will need to create new accounts and posts on the production site.