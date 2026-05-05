import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import * as auth from '../utils/auth.js';

vi.mock('../utils/auth.js', () => ({
  getSession: vi.fn(),
  setSession: vi.fn(),
  clearSession: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

/**
 * Helper to render ProtectedRoute within a MemoryRouter at a given path.
 * Includes catch-all routes for /login and /blogs to verify redirects.
 * @param {Object} options
 * @param {string} options.initialPath - The initial route entry.
 * @param {string} [options.role] - The role prop for ProtectedRoute.
 * @param {React.ReactNode} [options.children] - Children to render inside ProtectedRoute.
 */
function renderWithRouter({ initialPath, role, children }) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute role={role}>
              {children}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-protected"
          element={
            <ProtectedRoute role="admin">
              {children}
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/blogs" element={<div>Blogs Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute.jsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('unauthenticated users', () => {
    it('redirects to /login when no session exists', () => {
      auth.getSession.mockReturnValue(null);

      renderWithRouter({
        initialPath: '/protected',
        children: <div>Protected Content</div>,
      });

      expect(screen.getByText('Login Page')).toBeDefined();
      expect(screen.queryByText('Protected Content')).toBeNull();
    });

    it('redirects to /login when no session exists for admin route', () => {
      auth.getSession.mockReturnValue(null);

      renderWithRouter({
        initialPath: '/admin-protected',
        role: 'admin',
        children: <div>Admin Content</div>,
      });

      expect(screen.getByText('Login Page')).toBeDefined();
      expect(screen.queryByText('Admin Content')).toBeNull();
    });
  });

  describe('authenticated users', () => {
    it('renders children when user is authenticated and no role is required', () => {
      auth.getSession.mockReturnValue({
        username: 'testuser',
        role: 'user',
        displayName: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
      });

      renderWithRouter({
        initialPath: '/protected',
        children: <div>Protected Content</div>,
      });

      expect(screen.getByText('Protected Content')).toBeDefined();
      expect(screen.queryByText('Login Page')).toBeNull();
    });

    it('renders children when admin user accesses a non-role-restricted route', () => {
      auth.getSession.mockReturnValue({
        username: 'admin',
        role: 'admin',
        displayName: 'Admin',
        createdAt: '2024-01-01T00:00:00Z',
      });

      renderWithRouter({
        initialPath: '/protected',
        children: <div>Protected Content</div>,
      });

      expect(screen.getByText('Protected Content')).toBeDefined();
    });

    it('renders children when admin user accesses an admin-only route', () => {
      auth.getSession.mockReturnValue({
        username: 'admin',
        role: 'admin',
        displayName: 'Admin',
        createdAt: '2024-01-01T00:00:00Z',
      });

      renderWithRouter({
        initialPath: '/admin-protected',
        role: 'admin',
        children: <div>Admin Content</div>,
      });

      expect(screen.getByText('Admin Content')).toBeDefined();
      expect(screen.queryByText('Blogs Page')).toBeNull();
    });
  });

  describe('non-admin users accessing admin routes', () => {
    it('redirects to /blogs when a regular user accesses an admin-only route', () => {
      auth.getSession.mockReturnValue({
        username: 'regularuser',
        role: 'user',
        displayName: 'Regular User',
        createdAt: '2024-01-01T00:00:00Z',
      });

      renderWithRouter({
        initialPath: '/admin-protected',
        role: 'admin',
        children: <div>Admin Content</div>,
      });

      expect(screen.getByText('Blogs Page')).toBeDefined();
      expect(screen.queryByText('Admin Content')).toBeNull();
    });

    it('does not redirect a regular user when role prop is not set', () => {
      auth.getSession.mockReturnValue({
        username: 'regularuser',
        role: 'user',
        displayName: 'Regular User',
        createdAt: '2024-01-01T00:00:00Z',
      });

      renderWithRouter({
        initialPath: '/protected',
        children: <div>User Content</div>,
      });

      expect(screen.getByText('User Content')).toBeDefined();
      expect(screen.queryByText('Blogs Page')).toBeNull();
      expect(screen.queryByText('Login Page')).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('renders children when role prop is "user" and user has "user" role', () => {
      auth.getSession.mockReturnValue({
        username: 'testuser',
        role: 'user',
        displayName: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
      });

      render(
        <MemoryRouter initialEntries={['/user-route']}>
          <Routes>
            <Route
              path="/user-route"
              element={
                <ProtectedRoute role="user">
                  <div>User Route Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/blogs" element={<div>Blogs Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('User Route Content')).toBeDefined();
    });

    it('renders children when role prop is undefined', () => {
      auth.getSession.mockReturnValue({
        username: 'testuser',
        role: 'user',
        displayName: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
      });

      renderWithRouter({
        initialPath: '/protected',
        role: undefined,
        children: <div>No Role Required Content</div>,
      });

      expect(screen.getByText('No Role Required Content')).toBeDefined();
    });

    it('calls getSession exactly once per render', () => {
      auth.getSession.mockReturnValue({
        username: 'testuser',
        role: 'user',
        displayName: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
      });

      renderWithRouter({
        initialPath: '/protected',
        children: <div>Content</div>,
      });

      expect(auth.getSession).toHaveBeenCalledTimes(1);
    });
  });
});