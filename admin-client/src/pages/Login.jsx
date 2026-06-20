import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import auth from '../shared/auth';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.login(email, password);
      const redirect = location.state?.from?.pathname || '/dashboard';
      navigate(redirect, { replace: true });
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <span className="login-brand-icon">🏎️</span>
          <h1>Admin Dashboard</h1>
          <p>Sign in to manage your fleet</p>
        </div>

        {/* Error */}
        {error && <div className="login-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" id="admin-login-form">
          <div className="login-field">
            <label className="login-label" htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              className="login-input"
              type="email"
              placeholder="admin@carrental.com"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              className="login-input"
              type="password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="login-submit"
            id="admin-login-submit"
            disabled={loading}
          >
            {loading ? (
              <><span className="login-spinner" />Signing in…</>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
