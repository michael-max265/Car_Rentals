import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import './AdminRoute.css';

// Admin access code can be set via environment variable for security.
const ADMIN_CODE = process.env.REACT_APP_ADMIN_CODE || 'ADMIN123';
// Optional admin email whitelist for fallback.
const ADMIN_EMAILS = (process.env.REACT_APP_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuthStore();
  const location = useLocation();
  const [verified, setVerified] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState('');

  // Show loading while auth state resolves or profile is being fetched.
  if (loading || (user && !profile)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ fontSize: '20px', color: '#666' }}>Verifying Admin Access…</p>
      </div>
    );
  }

  // Determine if the current user is an admin.
  const isAdmin = profile?.isAdmin || ADMIN_EMAILS.includes(user?.email);

  // If not logged in, redirect to login.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If profile loaded but not admin, redirect to login.
  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }


  // Admin logged in but still needs to enter the secret code.
  if (!verified) {
    return (
      <div className="admin-verify-overlay">
        <div className="admin-verify-card">
          <h2 className="admin-verify-title">Admin Access Code</h2>
          <p className="admin-verify-subtitle">Enter the secret admin code to continue.</p>
          <input
            type="password"
            value={codeInput}
            onChange={e => setCodeInput(e.target.value)}
            className="admin-verify-input"
            placeholder="Secret Code"
          />
          {error && <p className="admin-verify-error">{error}</p>}
          <button
            onClick={() => {
              if (codeInput === ADMIN_CODE) {
                setVerified(true);
                setError('');
              } else {
                setError('Invalid admin code.');
              }
            }}
            className="admin-verify-btn"
          >
            Verify
          </button>
        </div>
      </div>
    );
  }

  // Admin verified – render the protected admin UI.
  return children;
};

export default AdminRoute;
