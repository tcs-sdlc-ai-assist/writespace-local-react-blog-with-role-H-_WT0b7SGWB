const POSTS_KEY = 'ws_posts';
const USERS_KEY = 'ws_users';

/**
 * Retrieve all posts from localStorage.
 * @returns {Array<Object>} Array of post objects, or empty array on failure.
 */
export function getPosts() {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read posts from localStorage:', error);
    return [];
  }
}

/**
 * Save an array of posts to localStorage.
 * @param {Array<Object>} posts - The posts array to persist.
 */
export function savePosts(posts) {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to save posts to localStorage:', error);
  }
}

/**
 * Retrieve all users from localStorage.
 * @returns {Array<Object>} Array of user objects, or empty array on failure.
 */
export function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read users from localStorage:', error);
    return [];
  }
}

/**
 * Save an array of users to localStorage.
 * @param {Array<Object>} users - The users array to persist.
 */
export function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users to localStorage:', error);
  }
}