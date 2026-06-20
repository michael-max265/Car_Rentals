import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const LINKS = {
  Company: [
    { label: 'Home',      to: '/' },
    { label: 'Showroom',  to: '/showroom' },
    { label: 'Bookings',  to: '/bookings' },
    { label: 'Dashboard', to: '/dashboard' },
  ],
  Account: [
    { label: 'Sign In',       to: '/login' },
    { label: 'Create Account', to: '/register' },
  ],
  Legal: [
    { label: 'Privacy Policy',    to: '#' },
    { label: 'Terms of Service',  to: '#' },
    { label: 'Cookie Policy',     to: '#' },
    { label: 'Insurance Terms',   to: '#' },
  ],
};

const SOCIALS = [
  { icon: '𝕏',  label: 'Twitter',   href: '#' },
  { icon: 'in', label: 'LinkedIn',   href: '#' },
  { icon: 'f',  label: 'Facebook',   href: '#' },
  { icon: '▶',  label: 'YouTube',    href: '#' },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Brand column */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div className="footer-logo-icon">🚗</div>
            CarRental
          </Link>
          <p className="footer-tagline">
            Premium cars. Transparent pricing.<br />
            The smartest way to rent.
          </p>

          {/* Socials */}
          <div className="footer-socials">
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} className="footer-social" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([heading, items]) => (
          <div key={heading} className="footer-col">
            <h4 className="footer-col-heading">{heading}</h4>
            <ul className="footer-col-list">
              {items.map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="footer-col-link">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© {year} CarRental. All rights reserved.</span>
        <div className="footer-bottom-badges">
          <span className="footer-badge">🔒 Secure Payments</span>
          <span className="footer-badge">⭐ 4.9 Rated</span>
          <span className="footer-badge">🌍 Worldwide</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
