import { v4 as uuidv4 } from 'uuid';
import { getUsers, saveUsers } from './storage.js';

const SESSION_KEY = 'ws_session';

/**
 * Retrieve the current session from localStorage.
 * @returns {{ username: string, role: 'admin'|'user', displayName: string, createdAt: string } | null}
 */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.username) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('Failed to read session from localStorage:', error);
    return null;
  }
}

/**
 * Save a session object to localStorage.
 * @param {{ username: string, role: 'admin'|'user', displayName: string, createdAt: string }} session
 */
export function setSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session to localStorage:', error);
  }
}

/**
 * Clear the current session from localStorage.
 */
export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session from localStorage:', error);
  }
}

/**
 * Attempt to log in with the given credentials.
 * Checks hardcoded admin credentials first, then localStorage users.
 * @param {string} username
 * @param {string} password
 * @returns {{ status: 'ok', session: object } | { status: 'error', error: string }}
 */
export function login(username, password) {
  try {
    if (!username || !password) {
      return { status: 'error', error: 'Username and password are required.' };
    }

    const trimmedUsername = username.trim().toLowerCase();

    if (trimmedUsername === 'admin' && password === 'admin123') {
      const session = {
        username: 'admin',
        role: 'admin',
        displayName: 'Admin',
        createdAt: new Date().toISOString(),
      };
      setSession(session);
      return { status: 'ok', session };
    }

    const users = getUsers();
    const user = users.find(
      (u) => u.username.toLowerCase() === trimmedUsername
    );

    if (!user) {
      return { status: 'error', error: 'User not found.' };
    }

    if (user.password !== password) {
      return { status: 'error', error: 'Incorrect password.' };
    }

    const session = {
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      createdAt: user.createdAt,
    };
    setSession(session);
    return { status: 'ok', session };
  } catch (error) {
    console.error('Login failed:', error);
    return { status: 'error', error: 'An unexpected error occurred during login.' };
  }
}

/**
 * Register a new user.
 * @param {{ username: string, displayName: string, password: string, confirmPassword: string }} userData
 * @returns {{ status: 'ok', user: object } | { status: 'error', error: string }}
 */
export function register({ username, displayName, password, confirmPassword }) {
  try {
    if (!username || !displayName || !password || !confirmPassword) {
      return { status: 'error', error: 'All fields are required.' };
    }

    if (password.length < 4) {
      return { status: 'error', error: 'Password must be at least 4 characters.' };
    }

    if (password !== confirmPassword) {
      return { status: 'error', error: 'Passwords do not match.' };
    }

    const trimmedUsername = username.trim().toLowerCase();

    if (trimmedUsername === 'admin') {
      return { status: 'error', error: 'Username already exists.' };
    }

    const users = getUsers();
    const existing = users.find(
      (u) => u.username.toLowerCase() === trimmedUsername
    );

    if (existing) {
      return { status: 'error', error: 'Username already exists.' };
    }

    const now = new Date().toISOString();
    const user = {
      id: uuidv4(),
      username: username.trim(),
      displayName: displayName.trim(),
      password,
      role: 'user',
      createdAt: now,
    };

    saveUsers([...users, user]);

    const session = {
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      createdAt: user.createdAt,
    };
    setSession(session);

    return { status: 'ok', user };
  } catch (error) {
    console.error('Registration failed:', error);
    return { status: 'error', error: 'An unexpected error occurred during registration.' };
  }
}