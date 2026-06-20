import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import './Auth.css';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithGoogle, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const location = useLocation();
  const handleGoogle = async () => {
    clearError();
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      const redirectPath = location.state?.from?.pathname || '/';
      navigate(redirectPath);
    } catch (err) {
      console.error('Google login failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);
    try {
      await login(email, password);
      const redirectPath = location.state?.from?.pathname || '/';
      navigate(redirectPath);
    } catch (err) {
      console.error('Login failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Top bar */}
      <div className="auth-topbar">
        <Link to="/" className="auth-home-btn">← Home</Link>
        <button type="button" className="auth-help">Need help?</button>
      </div>

      {/* Centered form */}
      <div className="auth-center">
        <div className="auth-card">

          <h1 className="auth-title">Sign in</h1>

          {error && <div className="auth-error">{error}</div>}

          {/* Google button */}
          <button type="button" className="auth-google-btn" onClick={handleGoogle} disabled={isSubmitting}>
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">or</div>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className="auth-input"
                type="password"
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div className="auth-checkbox-row">
              <input id="remember-me" type="checkbox" />
              <label htmlFor="remember-me">Remember me</label>
              <button type="button" className="auth-forgot">Forgot password?</button>
            </div>

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          <div className="auth-switch">
            New here? <Link to="/register">Create account</Link>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
