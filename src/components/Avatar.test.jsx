import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar, { getAvatar } from './Avatar.jsx';

describe('Avatar.jsx', () => {
  describe('getAvatar', () => {
    it('returns crown emoji with violet background for admin role', () => {
      const { container } = render(getAvatar('admin'));
      const span = container.querySelector('span');

      expect(span).toBeDefined();
      expect(span.textContent).toBe('👑');
      expect(span.className).toContain('bg-violet-100');
      expect(span.className).toContain('text-violet-700');
    });

    it('returns book emoji with indigo background for user role', () => {
      const { container } = render(getAvatar('user'));
      const span = container.querySelector('span');

      expect(span).toBeDefined();
      expect(span.textContent).toBe('📖');
      expect(span.className).toContain('bg-indigo-100');
      expect(span.className).toContain('text-indigo-700');
    });

    it('renders with correct aria-label for admin role', () => {
      render(getAvatar('admin'));
      const element = screen.getByRole('img', { name: 'Admin avatar' });

      expect(element).toBeDefined();
    });

    it('renders with correct aria-label for user role', () => {
      render(getAvatar('user'));
      const element = screen.getByRole('img', { name: 'User avatar' });

      expect(element).toBeDefined();
    });

    it('renders as a rounded-full span with correct sizing classes', () => {
      const { container } = render(getAvatar('user'));
      const span = container.querySelector('span');

      expect(span.className).toContain('rounded-full');
      expect(span.className).toContain('w-8');
      expect(span.className).toContain('h-8');
      expect(span.className).toContain('inline-flex');
      expect(span.className).toContain('items-center');
      expect(span.className).toContain('justify-center');
    });
  });

  describe('Avatar component', () => {
    it('renders admin avatar when role is admin', () => {
      render(<Avatar role="admin" />);
      const element = screen.getByRole('img', { name: 'Admin avatar' });

      expect(element).toBeDefined();
      expect(element.textContent).toBe('👑');
      expect(element.className).toContain('bg-violet-100');
      expect(element.className).toContain('text-violet-700');
    });

    it('renders user avatar when role is user', () => {
      render(<Avatar role="user" />);
      const element = screen.getByRole('img', { name: 'User avatar' });

      expect(element).toBeDefined();
      expect(element.textContent).toBe('📖');
      expect(element.className).toContain('bg-indigo-100');
      expect(element.className).toContain('text-indigo-700');
    });

    it('renders the same output as getAvatar for admin role', () => {
      const { container: componentContainer } = render(<Avatar role="admin" />);
      const { container: functionContainer } = render(getAvatar('admin'));

      expect(componentContainer.innerHTML).toBe(functionContainer.innerHTML);
    });

    it('renders the same output as getAvatar for user role', () => {
      const { container: componentContainer } = render(<Avatar role="user" />);
      const { container: functionContainer } = render(getAvatar('user'));

      expect(componentContainer.innerHTML).toBe(functionContainer.innerHTML);
    });
  });
});