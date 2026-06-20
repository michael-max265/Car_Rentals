import React from 'react';
import { Link } from 'react-router-dom';
import LocationMap from '../components/LocationMap';
import './Home.css';

const STATS = [
  { value: '500+', label: 'Cars Available' },
  { value: '12k+', label: 'Happy Customers' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '24/7', label: 'Support' },
];

const FEATURES = [
  {
    icon: '🚗',
    title: 'Wide Selection',
    desc: 'From compact city cars to luxury SUVs — find the perfect vehicle for every occasion.',
  },
  {
    icon: '🛡️',
    title: 'Full Insurance',
    desc: 'Choose from Basic, Standard or Premium cover. Drive with complete peace of mind.',
  },
  {
    icon: '⚡',
    title: 'Instant Booking',
    desc: 'Reserve your car in under 2 minutes. Real-time availability calendar with no double-bookings.',
  },
  {
    icon: '💳',
    title: 'Secure Payments',
    desc: 'Stripe-powered checkout. Your card details are never stored on our servers.',
  },
  {
    icon: '📍',
    title: 'Flexible Pickup',
    desc: 'Multiple pickup locations. Return anywhere with our flexible drop-off policy.',
  },
  {
    icon: '⭐',
    title: 'Trusted Reviews',
    desc: 'Real ratings from verified renters. Know exactly what you\'re getting before you book.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Browse the Showroom', desc: 'Explore our 3D interactive car catalog and compare vehicles side by side.' },
  { step: '02', title: 'Pick Your Dates', desc: 'Use our real-time calendar to select available dates and choose your insurance tier.' },
  { step: '03', title: 'Pay Securely', desc: 'Complete checkout in seconds with our Stripe-powered payment system.' },
  { step: '04', title: 'Hit the Road', desc: 'Receive your booking confirmation and pick up your car — it\'s that simple.' },
];

function Home() {
  return (
    <div className="home">

      {/* ── HERO ── */}
      <section className="home-hero">
        <div className="home-hero-bg">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-blob hero-blob-3" />
        </div>
        <div className="home-hero-content">
          <div className="hero-badge">✨ Over 12,000 rentals completed</div>
          <h1 className="hero-heading">
            Drive Your Dream<br />
            <span className="hero-heading-accent">Car Today</span>
          </h1>
          <p className="hero-sub">
            Premium cars. Transparent pricing. Instant booking.<br />
            The smartest way to rent a car.
          </p>
          <div className="hero-actions">
            <Link to="/showroom" className="hero-btn-primary">Browse Cars →</Link>
            <Link to="/register" className="hero-btn-secondary">Create Free Account</Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="hero-stats">
          {STATS.map((s, i) => (
            <div key={i} className="hero-stat">
              <span className="hero-stat-value">{s.value}</span>
              <span className="hero-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="home-section">
        <div className="home-section-inner">
          <div className="section-header">
            <p className="section-eyebrow">Why CarRental</p>
            <h2 className="section-title">Everything you need, nothing you don't</h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="home-section home-section-alt">
        <div className="home-section-inner">
          <div className="section-header">
            <p className="section-eyebrow">How it works</p>
            <h2 className="section-title">On the road in 4 easy steps</h2>
          </div>
          <div className="steps-grid">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{s.step}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FIND US MAP ── */}
      <LocationMap variant="home" />

      {/* ── CTA BANNER ── */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <h2 className="cta-title">Ready to hit the road?</h2>
          <p className="cta-sub">Join thousands of drivers who trust CarRental for every journey.</p>
          <Link to="/showroom" className="hero-btn-primary">Explore the Showroom</Link>
        </div>
      </section>

    </div>
  );
}

export default Home;
