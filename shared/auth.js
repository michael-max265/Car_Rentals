import api from './api';

/**
 * Perform login against the backend authentication endpoint.
 * Stores the returned JWT in localStorage and returns it.
 */
export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  const { token } = response.data;
  if (token) {
    localStorage.setItem('admin_jwt', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  return token;
}

/**
 * Remove the JWT from storage and clear auth header.
 */
export function logout() {
  localStorage.removeItem('admin_jwt');
  delete api.defaults.headers.common['Authorization'];
}

/** Retrieve stored JWT (if any). */
export function getToken() {
  return localStorage.getItem('admin_jwt');
}

/** Simple boolean helper */
export function isAuthenticated() {
  return !!getToken();
}

export default {
  login,
  logout,
  getToken,
  isAuthenticated,
};
