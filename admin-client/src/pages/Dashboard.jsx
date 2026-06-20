import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../shared/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="dashboard"><p>Loading dashboard...</p></div>;
  }
  if (error) {
    return <div className="dashboard"><p className="error">{error}</p></div>;
  }

  const { carCount, bookingCount, totalRevenue, activeBookings, cancellationRate } = stats || {};

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Admin Dashboard</h2>
      <nav className="admin-nav">
        <Link to="/analytics" className="nav-link">Analytics</Link>
        <Link to="/users" className="nav-link">Users</Link>
      </nav>
      <div className="stats-grid">
        <div className="stat-card card glass">
          <div className="stat-icon">🚗</div>
          <div className="stat-value">{carCount ?? '-'}</div>
          <div className="stat-label">Cars in fleet</div>
        </div>
        <div className="stat-card card glass">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{bookingCount ?? '-'}</div>
          <div className="stat-label">Total bookings</div>
        </div>
        <div className="stat-card card glass">
          <div className="stat-icon">💰</div>
          <div className="stat-value">${totalRevenue?.toLocaleString() ?? '-'}</div>
          <div className="stat-label">Total revenue</div>
        </div>
        <div className="stat-card card glass">
          <div className="stat-icon">🚀</div>
          <div className="stat-value">{activeBookings ?? '-'}</div>
          <div className="stat-label">Active bookings</div>
        </div>
        <div className="stat-card card glass">
          <div className="stat-icon">❌</div>
          <div className="stat-value">{cancellationRate ?? '-'}%</div>
          <div className="stat-label">Cancellation rate</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
