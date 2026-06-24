import { getAuth, getFirestore } from '../config/firebase.js';

/**
 * Middleware to ensure the request is made by an authenticated admin user.
 * It expects a valid Firebase ID token in the Authorization header.
 * If verification succeeds and the user has a `role` claim equal to "admin"
 * or has `isAdmin` equal to true in their Firestore user profile,
 * `req.user` is populated and `next()` is called. Otherwise a 403 response
 * is returned.
 */
export const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);
    
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    const isAdmin = decoded.role === 'admin' || (userDoc.exists && userDoc.data().isAdmin === true);

    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Admin auth error', err);
    return res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
};
