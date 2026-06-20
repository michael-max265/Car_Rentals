import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../shared/auth.js';

/**
 * A layout-route wrapper that checks authentication status.
 * If the user is not authenticated, they are redirected to the login page.
 * Usage: <Route element={<ProtectedRoute />}> ... nested routes ... </Route>
 */
export default function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
