import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPosts, savePosts, getUsers, saveUsers } from './storage.js';

describe('storage.js', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getPosts', () => {
    it('returns an empty array when no posts exist in localStorage', () => {
      const result = getPosts();
      expect(result).toEqual([]);
    });

    it('returns parsed posts array from localStorage', () => {
      const posts = [
        { id: '1', title: 'First Post', content: 'Hello world', author: 'testuser', createdAt: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Second Post', content: 'Another post', author: 'admin', createdAt: '2024-01-02T00:00:00Z' },
      ];
      localStorage.setItem('ws_posts', JSON.stringify(posts));

      const result = getPosts();
      expect(result).toEqual(posts);
      expect(result).toHaveLength(2);
    });

    it('returns an empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem('ws_posts', '{not valid json!!!');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = getPosts();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('returns an empty array when localStorage contains a non-array value', () => {
      localStorage.setItem('ws_posts', JSON.stringify({ not: 'an array' }));

      const result = getPosts();
      expect(result).toEqual([]);
    });

    it('returns an empty array when localStorage contains a string value', () => {
      localStorage.setItem('ws_posts', JSON.stringify('just a string'));

      const result = getPosts();
      expect(result).toEqual([]);
    });

    it('returns an empty array when localStorage.getItem throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = getPosts();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('savePosts', () => {
    it('saves posts array to localStorage', () => {
      const posts = [
        { id: '1', title: 'Test Post', content: 'Content here', author: 'user1', createdAt: '2024-06-01T00:00:00Z' },
      ];

      savePosts(posts);

      const stored = JSON.parse(localStorage.getItem('ws_posts'));
      expect(stored).toEqual(posts);
    });

    it('saves an empty array to localStorage', () => {
      savePosts([]);

      const stored = JSON.parse(localStorage.getItem('ws_posts'));
      expect(stored).toEqual([]);
    });

    it('overwrites existing posts in localStorage', () => {
      const oldPosts = [{ id: '1', title: 'Old' }];
      localStorage.setItem('ws_posts', JSON.stringify(oldPosts));

      const newPosts = [{ id: '2', title: 'New' }];
      savePosts(newPosts);

      const stored = JSON.parse(localStorage.getItem('ws_posts'));
      expect(stored).toEqual(newPosts);
    });

    it('handles localStorage.setItem throwing gracefully', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => savePosts([{ id: '1' }])).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getUsers', () => {
    it('returns an empty array when no users exist in localStorage', () => {
      const result = getUsers();
      expect(result).toEqual([]);
    });

    it('returns parsed users array from localStorage', () => {
      const users = [
        { id: 'u1', username: 'alice', displayName: 'Alice', role: 'user', password: 'pass1', createdAt: '2024-01-01T00:00:00Z' },
        { id: 'u2', username: 'bob', displayName: 'Bob', role: 'admin', password: 'pass2', createdAt: '2024-02-01T00:00:00Z' },
      ];
      localStorage.setItem('ws_users', JSON.stringify(users));

      const result = getUsers();
      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });

    it('returns an empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem('ws_users', 'corrupted data {{');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = getUsers();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('returns an empty array when localStorage contains a non-array value', () => {
      localStorage.setItem('ws_users', JSON.stringify(42));

      const result = getUsers();
      expect(result).toEqual([]);
    });

    it('returns an empty array when localStorage contains null', () => {
      localStorage.setItem('ws_users', JSON.stringify(null));

      const result = getUsers();
      expect(result).toEqual([]);
    });

    it('returns an empty array when localStorage.getItem throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = getUsers();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('saveUsers', () => {
    it('saves users array to localStorage', () => {
      const users = [
        { id: 'u1', username: 'charlie', displayName: 'Charlie', role: 'user', password: 'secret', createdAt: '2024-03-01T00:00:00Z' },
      ];

      saveUsers(users);

      const stored = JSON.parse(localStorage.getItem('ws_users'));
      expect(stored).toEqual(users);
    });

    it('saves an empty array to localStorage', () => {
      saveUsers([]);

      const stored = JSON.parse(localStorage.getItem('ws_users'));
      expect(stored).toEqual([]);
    });

    it('overwrites existing users in localStorage', () => {
      const oldUsers = [{ id: 'u1', username: 'old' }];
      localStorage.setItem('ws_users', JSON.stringify(oldUsers));

      const newUsers = [{ id: 'u2', username: 'new' }];
      saveUsers(newUsers);

      const stored = JSON.parse(localStorage.getItem('ws_users'));
      expect(stored).toEqual(newUsers);
    });

    it('handles localStorage.setItem throwing gracefully', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => saveUsers([{ id: 'u1' }])).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});