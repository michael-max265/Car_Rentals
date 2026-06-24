import api from './api';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Perform login against Firebase Authentication.
 * Verifies that the user has isAdmin set to true in Firestore.
 * Stores the returned JWT in localStorage and returns it.
 */
export async function login(email, password) {
  // 1. Authenticate with Firebase
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  try {
    // 2. Fetch the user profile from Firestore
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    // 3. Confirm they are an admin
    if (!docSnap.exists() || !docSnap.data().isAdmin) {
      // Not an admin, sign out immediately
      await signOut(auth);
      throw new Error('Access Denied: You do not have administrator privileges.');
    }

    // 4. Retrieve ID token and save it for axios requests
    const token = await user.getIdToken();
    if (token) {
      localStorage.setItem('admin_jwt', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return token;
  } catch (err) {
    // Sign out to clean up auth state in case of permission check failure
    await signOut(auth);
    throw err;
  }
}

/**
 * Remove the JWT from storage and clear auth header.
 */
export async function logout() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Firebase signout error:', err);
  }
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
