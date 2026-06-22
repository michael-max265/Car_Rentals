import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BookingCalendar from '../components/BookingCalendar';
import useCarStore from '../store/useCarStore';
import useAuthStore from '../store/useAuthStore';
import './Showroom.css';

// Lazy‑load heavy assets and widgets to speed up initial load times
// const CarViewer3D = lazy(() => import('../components/CarViewer3D'));
const LocationMap = lazy(() => import('../components/LocationMap'));

// Helper to format ISO date strings safely
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return isNaN(d) ? '' : d.toLocaleDateString();
};


const INSURANCE_OPTIONS = [
  { id: 'basic', label: 'Basic', dailyRate: 0, description: 'Included – liability cover only' },
  { id: 'standard', label: 'Standard', dailyRate: 15, description: '+$15/day – collision & theft' },
  { id: 'premium', label: 'Premium', dailyRate: 30, description: '+$30/day – full comprehensive cover' },
];


  
function Showroom() {
  const { cars, loading: carsLoading, error: carsError, fetchCars, selectedCar, setSelectedCar } = useCarStore();
  const { user, profile, fetchProfile } = useAuthStore();
  // const { createBooking } = useBookingStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const carIdParam = searchParams.get('carId');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedInsurance, setSelectedInsurance] = useState('basic');
  const [bookedRanges, setBookedRanges] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);


  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Fetch user profile with a fresh Firebase ID token for proper auth
  useEffect(() => {
    if (user) {
      user.getIdToken().then((token) => {
        fetchProfile(user.uid, token);
      });
    }
  }, [user, fetchProfile]);

  // Automatically select the first car (or URL specified car) if none is currently selected
  useEffect(() => {
    if (cars.length > 0) {
      if (carIdParam) {
        const found = cars.find(c => c.id === carIdParam);
        if (found) {
          setSelectedCar(found);
          return;
        }
      }
      if (!selectedCar) {
        setSelectedCar(cars[0]);
      }
    }
  }, [cars, carIdParam, selectedCar, setSelectedCar]);



  const fetchBookedRanges = useCallback(async (carId) => {
    setCalendarLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/car/${carId}`);
      const data = await res.json();
      setBookedRanges(Array.isArray(data) ? data : []);
    } catch {
      setBookedRanges([]);
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  const getRentalDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) return 0;
    const diff = end - start;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const calculateTotal = () => {
    if (!selectedCar || !startDate || !endDate) return 0;
    const days = getRentalDays();
    if (days <= 0) return 0;
    const carDailyRate = parseInt(selectedCar.price.replace(/[^0-9]/g, ''), 10) || 0;
    const insuranceDailyRate = INSURANCE_OPTIONS.find(o => o.id === selectedInsurance)?.dailyRate || 0;
    return days * (carDailyRate + insuranceDailyRate);
  };

  const getInsuranceCost = () => {
    const days = getRentalDays();
    const insuranceDailyRate = INSURANCE_OPTIONS.find(o => o.id === selectedInsurance)?.dailyRate || 0;
    return days * insuranceDailyRate;
  };

  const handleProceedToPayment = async () => {
    if (!user) { alert('Please log in to book a car.'); return; }
    const total = calculateTotal();
    if (total <= 0) { alert('Please select valid start and end dates.'); return; }

    const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    const checkoutState = {
      total,
      startDate,
      endDate,
      selectedInsurance,
      insuranceCost: getInsuranceCost()
    };

    if (!key || key.startsWith('pk_test_placeholder')) {
       navigate(`/checkout/${selectedCar.id}`, {
         state: { ...checkoutState, clientSecret: 'mock_secret_' + Date.now() }
       });
       return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: total * 100 }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        alert(`Payment server error: ${err.error || response.status}`);
        return;
      }

      const data = await response.json();
      navigate(`/checkout/${selectedCar.id}`, {
         state: { ...checkoutState, clientSecret: data.clientSecret }
      });
    } catch (error) {
      console.error('Failed to initiate payment', error);
      alert('Could not reach the payment server. Make sure the backend is running on port 5000.');
    }
  };

  const total = calculateTotal();
  return (
    <div className="showroom-container">
      <h1>3D Car Showroom</h1>

      <div className="showroom-content">
        {/* ── LEFT: 3D viewer + booking ── */}
        <div className="viewer-section">
          {selectedCar ? (
            <div className="booking-box">
              <h3 className="booking-box-title">Book This Car</h3>
              <div className="banner">
                <p className="banner-title">Developer Sandbox Mode Active</p>
                <p className="banner-text">Stripe is not configured. Interactive payment simulation will be used to process this booking.</p>
              </div>
            </div>
          ) : null}

          {selectedCar && (
            <div className="car-detail-section" key={selectedCar.id}>
              {/* Car Image */}
              {selectedCar.image && (
                <img src={selectedCar.image} alt={selectedCar.name} className="car-detail-img" crossOrigin="anonymous" referrerPolicy="no-referrer" loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/300'; }} />
              )}
              {/* Car Name */}
              <h2 className="car-detail-name">{selectedCar.name}</h2>
              {/* Description */}
              {selectedCar.description && (
                <p className="car-detail-description">{selectedCar.description}</p>
              )}
              {/* Specs / Accessories */}
              {selectedCar.specs && (
                <div className="car-specs-grid">
                  <div className="car-spec"><span className="spec-icon">🪑</span>{selectedCar.specs.seats} Seats</div>
                  <div className="car-spec"><span className="spec-icon">⛽</span>{selectedCar.specs.fuel}</div>
                  <div className="car-spec"><span className="spec-icon">🛣️</span>{selectedCar.specs.range}</div>
                  <div className="car-spec"><span className="spec-icon">⚙️</span>{selectedCar.specs.transmission}</div>
                </div>
              )}
            </div>
          )}


          {/* Date Calendar */}
          <div className="booking-field">
            <label className="booking-label">
              Select Rental Dates
              {startDate && endDate && (
                <span className="booking-dates-selected">{formatDate(startDate)} → {formatDate(endDate)}</span>
              )}
              {startDate && !endDate && (
                <span className="booking-dates-hint">Now select end date…</span>
              )}
            </label>
            {calendarLoading ? (
              <p className="booking-loading">Loading availability…</p>
            ) : (
              <BookingCalendar
                bookedRanges={bookedRanges}
                startDate={startDate}
                endDate={endDate}
                onRangeSelect={(s, e) => { setStartDate(s); setEndDate(e); }}
              />
            )}
          </div>

          {/* Insurance */}
          <div className="booking-field">
            <label className="booking-label">Insurance Coverage</label>
            <div className="insurance-options">
              {INSURANCE_OPTIONS.map(option => (
                <label
                  key={option.id}
                  className={`insurance-option ${selectedInsurance === option.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="insurance"
                    value={option.id}
                    checked={selectedInsurance === option.id}
                    onChange={() => setSelectedInsurance(option.id)}
                  />
                  <div>
                    <p className="insurance-label">{option.label}</p>
                    <p className="insurance-desc">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Price summary */}
          {total > 0 && (
            <div className="price-summary">
              <div className="price-row">
                <span>Car rental ({getRentalDays()} day{getRentalDays() !== 1 ? 's' : ''})</span>
                <span>${getRentalDays() * (parseInt(selectedCar.price.replace(/[^0-9]/g, ''), 10) || 0)}</span>
              </div>
              {getInsuranceCost() > 0 && (
                <div className="price-row">
                  <span>{INSURANCE_OPTIONS.find(o => o.id === selectedInsurance)?.label} Insurance</span>
                  <span>+${getInsuranceCost()}</span>
                </div>
              )}
              <div className="price-row price-total">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>
          )}

          {/* License warning – shown when profile loaded but no license set */}
          {user && profile && !profile.licenseNumber && (
            <div id="license-warning" className="license-warning-banner">
              <span>🪪</span>
              <div>
                <p className="license-warning-title">Driver's License Required</p>
                <p className="license-warning-text">
                  Add your license in{' '}
                  <a href="/dashboard" className="license-warning-link">Dashboard → Profile</a>{' '}
                  before booking.
                </p>
              </div>
            </div>
          )}

          {total > 0 && (
            <button className="booking-btn" onClick={handleProceedToPayment}>
              Proceed to Payment
            </button>
          )}

          {/* Pickup Locations Map */}
          <Suspense fallback={<div className="skeleton" style={{ height: '350px', borderRadius: '12px', marginTop: '2rem' }}></div>}>
            <LocationMap variant="inline" />
          </Suspense>
        </div> {/* close viewer-section */}

{/* ── RIGHT: Car catalog ── */}
      <div className="catalog-section">
        <h2>Available Cars</h2>
        {carsLoading && (
          <div className="cars-loading">
            {[1, 2, 3, 4].map(i => <div key={i} className="car-card-skeleton" />)}
          </div>
        )}
        {carsError && <p className="cars-error">Error: {carsError}</p>}
        {!carsLoading && !carsError && cars.length === 0 && <p>No cars available.</p>}

        <div className="car-list">
          {cars.slice(0, 6).map((car) => (
            <div
              key={car.id}
              className={`car-card ${selectedCar?.id === car.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedCar(car);
                setStartDate('');
                setEndDate('');
                setBookedRanges([]);
                fetchBookedRanges(car.id);
              }}
            >
              <img src={car.image ? car.image : 'https://via.placeholder.com/300'} alt={car.name} className="car-card-img" loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/300'; }} />
              <h3>{car.name}</h3>
              <p className="price">{car.price}</p>
              
            </div>
          ))}

          <button className="more-cars-btn" onClick={() => navigate('/catalog')}>More Cars →</button>
        </div> {/* close car-list */}
      </div> {/* close catalog-section */}
    </div> {/* close showroom-content */}
  </div>
);

}

        export default Showroom;
