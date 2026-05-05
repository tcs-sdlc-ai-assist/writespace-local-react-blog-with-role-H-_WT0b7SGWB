import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSession, setSession, clearSession, login, register } from './auth.js';

describe('auth.js', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getSession', () => {
    it('returns null when no session exists in localStorage', () => {
      const result = getSession();
      expect(result).toBeNull();
    });

    it('returns parsed session object from localStorage', () => {
      const session = {
        username: 'testuser',
        role: 'user',
        displayName: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
      };
      localStorage.setItem('ws_session', JSON.stringify(session));

      const result = getSession();
      expect(result).toEqual(session);
    });

    it('returns null when localStorage contains invalid JSON', () => {
      localStorage.setItem('ws_session', '{broken json!!');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = getSession();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('returns null when session object has no username', () => {
      localStorage.setItem('ws_session', JSON.stringify({ role: 'user' }));

      const result = getSession();
      expect(result).toBeNull();
    });

    it('returns null when session is a non-object value', () => {
      localStorage.setItem('ws_session', JSON.stringify('just a string'));

      const result = getSession();
      expect(result).toBeNull();
    });

    it('returns null when session is null', () => {
      localStorage.setItem('ws_session', JSON.stringify(null));

      const result = getSession();
      expect(result).toBeNull();
    });

    it('returns null when localStorage.getItem throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = getSession();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('setSession', () => {
    it('saves session object to localStorage', () => {
      const session = {
        username: 'alice',
        role: 'user',
        displayName: 'Alice',
        createdAt: '2024-06-01T00:00:00Z',
      };

      setSession(session);

      const stored = JSON.parse(localStorage.getItem('ws_session'));
      expect(stored).toEqual(session);
    });

    it('overwrites existing session in localStorage', () => {
      const oldSession = { username: 'old', role: 'user', displayName: 'Old', createdAt: '2024-01-01T00:00:00Z' };
      localStorage.setItem('ws_session', JSON.stringify(oldSession));

      const newSession = { username: 'new', role: 'admin', displayName: 'New', createdAt: '2024-06-01T00:00:00Z' };
      setSession(newSession);

      const stored = JSON.parse(localStorage.getItem('ws_session'));
      expect(stored).toEqual(newSession);
    });

    it('handles localStorage.setItem throwing gracefully', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => setSession({ username: 'test', role: 'user', displayName: 'Test', createdAt: '2024-01-01T00:00:00Z' })).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('clearSession', () => {
    it('removes session from localStorage', () => {
      const session = { username: 'testuser', role: 'user', displayName: 'Test', createdAt: '2024-01-01T00:00:00Z' };
      localStorage.setItem('ws_session', JSON.stringify(session));

      clearSession();

      expect(localStorage.getItem('ws_session')).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => clearSession()).not.toThrow();
    });

    it('handles localStorage.removeItem throwing gracefully', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => clearSession()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns error when username is empty', () => {
      const result = login('', 'password');
      expect(result.status).toBe('error');
      expect(result.error).toBe('Username and password are required.');
    });

    it('returns error when password is empty', () => {
      const result = login('admin', '');
      expect(result.status).toBe('error');
      expect(result.error).toBe('Username and password are required.');
    });

    it('returns error when both username and password are empty', () => {
      const result = login('', '');
      expect(result.status).toBe('error');
      expect(result.error).toBe('Username and password are required.');
    });

    it('logs in hardcoded admin with correct credentials', () => {
      const result = login('admin', 'admin123');

      expect(result.status).toBe('ok');
      expect(result.session).toBeDefined();
      expect(result.session.username).toBe('admin');
      expect(result.session.role).toBe('admin');
      expect(result.session.displayName).toBe('Admin');
    });

    it('saves session to localStorage on successful admin login', () => {
      login('admin', 'admin123');

      const stored = JSON.parse(localStorage.getItem('ws_session'));
      expect(stored).toBeDefined();
      expect(stored.username).toBe('admin');
      expect(stored.role).toBe('admin');
    });

    it('logs in hardcoded admin case-insensitively', () => {
      const result = login('Admin', 'admin123');

      expect(result.status).toBe('ok');
      expect(result.session.username).toBe('admin');
      expect(result.session.role).toBe('admin');
    });

    it('returns error for hardcoded admin with wrong password', () => {
      const result = login('admin', 'wrongpassword');

      expect(result.status).toBe('error');
      expect(result.error).toBe('User not found.');
    });

    it('logs in a registered user with correct credentials', () => {
      const users = [
        {
          id: 'u1',
          username: 'alice',
          displayName: 'Alice',
          password: 'pass1234',
          role: 'user',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];
      localStorage.setItem('ws_users', JSON.stringify(users));

      const result = login('alice', 'pass1234');

      expect(result.status).toBe('ok');
      expect(result.session.username).toBe('alice');
      expect(result.session.role).toBe('user');
      expect(result.session.displayName).toBe('Alice');
    });

    it('saves session to localStorage on successful user login', () => {
      const users = [
        {
          id: 'u1',
          username: 'bob',
          displayName: 'Bob',
          password: 'bobpass',
          role: 'user',
          createdAt: '2024-02-01T00:00:00Z',
        },
      ];
      localStorage.setItem('ws_users', JSON.stringify(users));

      login('bob', 'bobpass');

      const stored = JSON.parse(localStorage.getItem('ws_session'));
      expect(stored).toBeDefined();
      expect(stored.username).toBe('bob');
      expect(stored.role).toBe('user');
    });

    it('logs in a registered user case-insensitively', () => {
      const users = [
        {
          id: 'u1',
          username: 'Charlie',
          displayName: 'Charlie',
          password: 'charliepass',
          role: 'user',
          createdAt: '2024-03-01T00:00:00Z',
        },
      ];
      localStorage.setItem('ws_users', JSON.stringify(users));

      const result = login('charlie', 'charliepass');

      expect(result.status).toBe('ok');
      expect(result.session.username).toBe('Charlie');
    });

    it('returns error when user is not found', () => {
      const result = login('nonexistent', 'password');

      expect(result.status).toBe('error');
      expect(result.error).toBe('User not found.');
    });

    it('returns error when password is incorrect for a registered user', () => {
      const users = [
        {
          id: 'u1',
          username: 'dave',
          displayName: 'Dave',
          password: 'correctpass',
          role: 'user',
          createdAt: '2024-04-01T00:00:00Z',
        },
      ];
      localStorage.setItem('ws_users', JSON.stringify(users));

      const result = login('dave', 'wrongpass');

      expect(result.status).toBe('error');
      expect(result.error).toBe('Incorrect password.');
    });

    it('checks hardcoded admin before localStorage users', () => {
      const users = [
        {
          id: 'u1',
          username: 'admin',
          displayName: 'Fake Admin',
          password: 'fakepass',
          role: 'user',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];
      localStorage.setItem('ws_users', JSON.stringify(users));

      const result = login('admin', 'admin123');

      expect(result.status).toBe('ok');
      expect(result.session.role).toBe('admin');
      expect(result.session.displayName).toBe('Admin');
    });
  });

  describe('register', () => {
    it('registers a new user successfully', () => {
      const result = register({
        username: 'newuser',
        displayName: 'New User',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      });

      expect(result.status).toBe('ok');
      expect(result.user).toBeDefined();
      expect(result.user.username).toBe('newuser');
      expect(result.user.displayName).toBe('New User');
      expect(result.user.role).toBe('user');
      expect(result.user.id).toBeDefined();
      expect(result.user.createdAt).toBeDefined();
    });

    it('saves user to localStorage on successful registration', () => {
      register({
        username: 'newuser',
        displayName: 'New User',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      });

      const users = JSON.parse(localStorage.getItem('ws_users'));
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('newuser');
    });

    it('saves session to localStorage on successful registration', () => {
      register({
        username: 'newuser',
        displayName: 'New User',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      });

      const session = JSON.parse(localStorage.getItem('ws_session'));
      expect(session).toBeDefined();
      expect(session.username).toBe('newuser');
      expect(session.role).toBe('user');
      expect(session.displayName).toBe('New User');
    });

    it('returns error when username is empty', () => {
      const result = register({
        username: '',
        displayName: 'Test',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      });

      expect(result.status).toBe('error');
      expect(result.error).toBe('All fields are required.');
    });

    it('returns error when displayName is empty', () => {
      const result = register({
        username: 'testuser',
        displayName: '',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      });

      expect(result.status).toBe('error');
      expect(result.error).toBe('All fields are required.');
    });

    it('returns error when password is empty', () => {
      const result = register({
        username: 'testuser',
        displayName: 'Test',
        password: '',
        confirmPassword: '',
      });

      expect(result.status).toBe('error');
      expect(result.error).toBe('All fields are required.');
    });

    it('returns error when confirmPassword is empty', () => {
      const result = register({
        username: 'testuser',
        displayName: 'Test',
        password: 'pass1234',
        confirmPassword: '',
      });

      expect(result.status).toBe('error');
      expect(result.error).toBe('All fields are required.');
    });

    it('returns error when password is less than 4 characters', () => {
      const result = register({
        username: 'testuser',
        displayName: 'Test',
        password: 'abc',
        confirmPassword: 'abc',
      });

      expect(result.status).toBe('error');
      expect(result.error).toBe('Password must be at least 4 characters.');
    });

    it('returns error when passwords do not match', () => {
      const result = register({
        username: 'testuser',
        displayName: 'Test',
        password: 'pass1234',
        confirmPassword: 'different',
      });

      expect(result.status).toBe('error');
      expect(result.error).toBe('Passwords do not match.');
    });

    it('returns error when username is "admin" (hardcoded admin conflict)', () => {
      const result = register({
        username: 'admin',
        displayName: 'Fake Admin',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      });

      expect(result.status).toBe('error');
      expect(result.error).toBe('Username already exists.');
    });

    it('returns error when username is "Admin" case-insensitively', () => {
      const result = register({
        username: 'Admin',
        displayName: 'Fake Admin',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      });

      expect(result.status).toBe('error');
      expect(result.error).toBe('Username already exists.');
    });

    it('returns error when username already exists in localStorage', () => {
      const users = [
        {
          id: 'u1',
          username: 'existinguser',
          displayName: 'Existing',
          password: 'pass1234',
          role: 'user',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];
      localStorage.setItem('ws_users', JSON.stringify(users));

      const result = register({
        username: 'existinguser',
        displayName: 'Another User',
        password: 'pass5678',
        confirmPassword: 'pass5678',
      });

      expect(result.status).toBe('error');
      expect(result.error).toBe('Username already exists.');
    });

    it('returns error when username already exists case-insensitively', () => {
      const users = [
        {
          id: 'u1',
          username: 'Alice',
          displayName: 'Alice',
          password: 'pass1234',
          role: 'user',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];
      localStorage.setItem('ws_users', JSON.stringify(users));

      const result = register({
        username: 'alice',
        displayName: 'Another Alice',
        password: 'pass5678',
        confirmPassword: 'pass5678',
      });

      expect(result.status).toBe('error');
      expect(result.error).toBe('Username already exists.');
    });

    it('trims username and displayName before saving', () => {
      const result = register({
        username: '  spaceduser  ',
        displayName: '  Spaced Name  ',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      });

      expect(result.status).toBe('ok');
      expect(result.user.username).toBe('spaceduser');
      expect(result.user.displayName).toBe('Spaced Name');
    });

    it('appends new user to existing users in localStorage', () => {
      const existingUsers = [
        {
          id: 'u1',
          username: 'firstuser',
          displayName: 'First',
          password: 'pass1234',
          role: 'user',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];
      localStorage.setItem('ws_users', JSON.stringify(existingUsers));

      register({
        username: 'seconduser',
        displayName: 'Second',
        password: 'pass5678',
        confirmPassword: 'pass5678',
      });

      const users = JSON.parse(localStorage.getItem('ws_users'));
      expect(users).toHaveLength(2);
      expect(users[1].username).toBe('seconduser');
    });

    it('assigns role "user" to newly registered users', () => {
      const result = register({
        username: 'regularuser',
        displayName: 'Regular',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      });

      expect(result.status).toBe('ok');
      expect(result.user.role).toBe('user');
    });

    it('generates a unique id for each registered user', () => {
      register({
        username: 'user1',
        displayName: 'User One',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      });

      register({
        username: 'user2',
        displayName: 'User Two',
        password: 'pass5678',
        confirmPassword: 'pass5678',
      });

      const users = JSON.parse(localStorage.getItem('ws_users'));
      expect(users).toHaveLength(2);
      expect(users[0].id).toBeDefined();
      expect(users[1].id).toBeDefined();
      expect(users[0].id).not.toBe(users[1].id);
    });
  });
});