import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useBookingStore from '../store/useBookingStore';
import useAuthStore from '../store/useAuthStore';
import './Bookings.css';

const parseDate = (val) => {
  if (!val) return null;
  if (val._seconds) return new Date(val._seconds * 1000);
  if (val.seconds) return new Date(val.seconds * 1000);
  return new Date(val);
};

const STATUS_CLASS = {
  confirmed: 'status-confirmed',
  active:    'status-active',
  pending:   'status-pending',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
};

const INSURANCE_CLASS = {
  premium:  'insurance-premium',
  standard: 'insurance-standard',
  basic:    'insurance-basic',
};

function Bookings() {
  const { user } = useAuthStore();
  const { bookings, loading, error, fetchUserBookings } = useBookingStore();

  useEffect(() => {
    if (user) fetchUserBookings(user.uid);
  }, [user, fetchUserBookings]);

  if (!user) {
    return (
      <div className="bookings-page">
        <div className="bookings-state">
          <div className="bookings-state-icon">🔒</div>
          <h3>You're not logged in</h3>
          <p><Link to="/login">Log in</Link> to view your bookings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <h1 className="bookings-heading">Your Bookings</h1>
      <p className="bookings-sub">All your car rental reservations in one place.</p>

      {error && <div className="bookings-error">⚠️ {error}</div>}

      {loading && (
        <div className="bookings-state">
          <div className="bookings-state-icon">⏳</div>
          <p>Loading your bookings…</p>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="bookings-state">
          <div className="bookings-state-icon">🚗</div>
          <h3>No bookings yet</h3>
          <p>Visit the <Link to="/showroom">Showroom</Link> to book your first car!</p>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="bookings-grid">
          {bookings.map(booking => {
            const insuranceClass = INSURANCE_CLASS[booking.insuranceType] || 'insurance-basic';
            const statusClass    = STATUS_CLASS[booking.status]    || '';

            const start = booking.startDate ? parseDate(booking.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
            const end   = booking.endDate   ? parseDate(booking.endDate).toLocaleDateString('en-GB',   { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

            return (
              <div key={booking.id} className="booking-card">
                <div className="booking-card-header">
                  <span className="booking-ref">#{booking.id.slice(-8).toUpperCase()}</span>
                  <span className={`booking-status ${statusClass}`}>{booking.status || 'pending'}</span>
                </div>

                <div className="booking-info">
                  <div className="booking-info-row">
                    <span className="booking-info-label">Car</span>
                    <span className="booking-info-value">{booking.carId?.slice(-6) || '—'}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="booking-info-label">From</span>
                    <span className="booking-info-value">{start}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="booking-info-label">To</span>
                    <span className="booking-info-value">{end}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="booking-info-label">Payment</span>
                    <span className="booking-info-value" style={{ textTransform: 'capitalize' }}>
                      {booking.paymentProvider || 'stripe'}
                    </span>
                  </div>
                  {booking.insuranceType && (
                    <div className="booking-info-row">
                      <span className="booking-info-label">Insurance</span>
                      <span className="booking-info-value">
                        <span className={`insurance-badge ${insuranceClass}`}>
                          {booking.insuranceType}
                          {booking.insuranceCost > 0 && ` +$${booking.insuranceCost}`}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="booking-total">
                  <span className="booking-total-label">Total Paid</span>
                  <span className="booking-total-value">${booking.totalPrice ?? '—'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Bookings;
