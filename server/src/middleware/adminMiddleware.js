import { getAuth } from '../config/firebase.js';

/**
 * Middleware to ensure the request is made by an authenticated admin user.
 * It expects a valid Firebase ID token in the Authorization header.
 * If verification succeeds and the user has a `role` claim equal to "admin",
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
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Admin auth error', err);
    return res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
};
