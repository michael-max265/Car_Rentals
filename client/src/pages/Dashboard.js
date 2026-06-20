import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import useBookingStore from '../store/useBookingStore';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const { user, profile, fetchProfile, updateProfile } = useAuthStore();
  const { bookings, fetchUserBookings } = useBookingStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', licenseNumber: '', email: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile(user.uid);
      fetchUserBookings(user.uid);
    }
  }, [user, fetchProfile, fetchUserBookings]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        licenseNumber: profile.licenseNumber || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const success = await updateProfile(formData);
    if (success) {
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } else {
      setMessage('Failed to update profile.');
    }
  };

  if (!profile) {
    return <div className="dashboard-loading">Loading profile...</div>;
  }

  const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'confirmed');

  return (
    <div className="dashboard-page-container">
      <h1 className="dashboard-title">User Dashboard</h1>
      <p className="dashboard-subtitle">Manage your profile, active rentals, and bookings history.</p>
      
      {message && <div className="dashboard-alert">{message}</div>}

      <div className="dashboard-grid">
        {/* Profile Card */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Profile Information</h2>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="dashboard-edit-btn"
              >
                Edit Profile
              </button>
            )}
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="dashboard-form">
              <div className="dashboard-field">
                <label className="dashboard-label">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="dashboard-input"
                  required
                />
              </div>
              <div className="dashboard-field">
                <label className="dashboard-label">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="dashboard-input"
                />
              </div>
              <div className="dashboard-field">
                <label className="dashboard-label">
                  Driver's License Number <span className="dashboard-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  placeholder="e.g. DL-1234567"
                  className="dashboard-input"
                  required
                />
                <p className="dashboard-input-hint">Required to complete a car booking.</p>
              </div>
              <div className="dashboard-field">
                <label className="dashboard-label">Email <span className="dashboard-required">*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="dashboard-input"
                  required
                />
              </div>
              <div className="dashboard-actions">
                <button
                  type="submit"
                  className="dashboard-save-btn"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="dashboard-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="dashboard-info-list">
              <div className="dashboard-info-row">
                <span className="dashboard-info-label">Name:</span>
                <span className="dashboard-info-value">{profile.name || 'Not set'}</span>
              </div>
              <div className="dashboard-info-row">
                <span className="dashboard-info-label">Email:</span>
                <span className="dashboard-info-value">{profile.email}</span>
              </div>
              <div className="dashboard-info-row">
                <span className="dashboard-info-label">Phone:</span>
                <span className="dashboard-info-value">{profile.phone || 'Not set'}</span>
              </div>
              <div className="dashboard-info-row">
                <span className="dashboard-info-label">Driver's License:</span>
                <span className="dashboard-info-value">
                  {profile.licenseNumber ? (
                    <span className="dashboard-badge-success">{profile.licenseNumber} ✓</span>
                  ) : (
                    <span className="dashboard-badge-danger">Missing – required for booking</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats / Activity Section */}
        <div className="dashboard-card">
          <h2 className="dashboard-card-title" style={{ marginBottom: '24px' }}>Activity Summary</h2>
          <div className="dashboard-stats-grid">
            <div className="dashboard-stat-card dashboard-stat-blue">
              <p className="dashboard-stat-label">Total Bookings</p>
              <p className="dashboard-stat-value">{bookings.length}</p>
            </div>
            <div className="dashboard-stat-card dashboard-stat-green">
              <p className="dashboard-stat-label">Active Rentals</p>
              <p className="dashboard-stat-value">{activeBookings.length}</p>
            </div>
          </div>
          
          <div className="dashboard-quick-actions">
            <Link to="/bookings" className="dashboard-link-btn">
              View Bookings History &rarr;
            </Link>
            {!profile.isAdmin && (
              <button 
                onClick={async () => {
                  const success = await updateProfile({ ...profile, isAdmin: true });
                  if (success) window.location.reload();
                }}
                className="dashboard-admin-btn"
              >
                ⚡ Become Administrator (Demo)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
