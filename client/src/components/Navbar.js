import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
    setMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <div className="navbar-logo-dot">🚗</div>
          CarRental
        </Link>

        {/* Hamburger */}
        <div className="hamburger" onClick={toggleMenu} aria-label="Toggle navigation" role="button">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        {/* Links */}
        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li className="nav-item"><Link to="/" className="nav-link" onClick={closeMenu}>Home</Link></li>
          <li className="nav-item"><Link to="/showroom" className="nav-link" onClick={closeMenu}>Showroom</Link></li>
          {user ? (
            <>
              <li className="nav-item"><Link to="/bookings" className="nav-link" onClick={closeMenu}>Bookings</Link></li>
              <li className="nav-item"><Link to="/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link></li>
              <li className="nav-item"><button onClick={handleLogout} className="nav-link nav-logout">Logout</button></li>
            </>
          ) : (
            <>
              <li className="nav-item"><Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link></li>
              <li className="nav-item"><Link to="/register" className="nav-link nav-cta" onClick={closeMenu}>Get Started</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
