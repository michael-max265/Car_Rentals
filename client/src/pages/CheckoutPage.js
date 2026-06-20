import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MockCheckoutForm from '../components/MockCheckoutForm';
import useBookingStore from '../store/useBookingStore';
import useAuthStore from '../store/useAuthStore';
import '../styles/CheckoutPage.css';

// Lazy‑load payment gateways so their dependencies aren't loaded unless used
const PayPalCheckout = lazy(() => import('../components/checkout/PayPalCheckout'));
const PaystackCheckout = lazy(() => import('../components/checkout/PaystackCheckout'));
const FlutterwaveCheckout = lazy(() => import('../components/checkout/FlutterwaveCheckout'));
const BraintreeCheckout = lazy(() => import('../components/checkout/BraintreeCheckout'));

// Lazy-load Stripe only when needed
let stripePromise = null;
const getStripe = () => {
  const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  if (!key || key.startsWith('pk_test_placeholder')) return null;
  if (!stripePromise) {
    import('@stripe/stripe-js').then(({ loadStripe }) => {
      stripePromise = loadStripe(key);
    });
  }
  return stripePromise;
};

const PAYMENT_METHODS = [
  { id: 'stripe',      label: 'Credit / Debit Card',  icon: '💳', desc: 'Stripe secure checkout' },
  { id: 'paypal',      label: 'PayPal',               icon: '🅿️', desc: 'Pay with your PayPal account' },
  { id: 'paystack',    label: 'Paystack',             icon: '🏷️', desc: 'Cards, bank, mobile money' },
  { id: 'flutterwave', label: 'Flutterwave',          icon: '🦋', desc: 'Cards, mobile money, USSD' },
  { id: 'braintree',   label: 'Braintree',            icon: '🏦', desc: 'Cards & PayPal via Braintree' },
];

export default function CheckoutPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuthStore();
  const { createBooking } = useBookingStore();

  // Booking details from Showroom
  const clientSecret     = state?.clientSecret;
  const total            = state?.total;
  const startDate        = state?.startDate;
  const endDate          = state?.endDate;
  const selectedInsurance = state?.selectedInsurance;
  const insuranceCost    = state?.insuranceCost;

  // Local state
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [Elements, setElements] = useState(null);
  const [CheckoutForm, setCheckoutForm] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Get Firebase auth token for backend calls
  useEffect(() => {
    if (user) {
      user.getIdToken().then(setAuthToken).catch(console.error);
    }
  }, [user]);

  // Load Stripe components lazily when real Stripe key exists
  useEffect(() => {
    if (clientSecret && !clientSecret.startsWith('mock_secret_') && !CheckoutForm) {
      Promise.all([
        import('@stripe/react-stripe-js'),
        import('../components/CheckoutForm'),
      ])
        .then(([stripeReact, cf]) => {
          setElements(() => stripeReact.Elements);
          setCheckoutForm(() => cf.default);
        })
        .catch(console.error);
    }
  }, [clientSecret, CheckoutForm]);

  /* ─── Success handler – creates booking and redirects ─── */
  const handleSuccess = async (paymentResult) => {
    try {
      const token = authToken || (await user.getIdToken());
      await createBooking(
        {
          userId: user.uid,
          carId,
          startDate,
          endDate,
          insuranceType: selectedInsurance,
          insuranceCost,
          totalPrice: total,
          paymentIntentId: paymentResult.id,
          paymentProvider: paymentMethod,
        },
        token
      );
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save booking', error);
      alert('Payment succeeded but failed to save booking. Please contact support.');
    }
  };

  /* ─── Error handler ─── */
  const handlePaymentError = (err) => {
    console.error('Payment error:', err);
    setPaymentError(err?.message || 'An error occurred during payment.');
  };

  /* ─── Render the correct gateway form ─── */
  const renderPaymentForm = () => {
    const userEmail = user?.email || 'customer@example.com';
    const userName = user?.displayName || 'Customer';

    switch (paymentMethod) {
      case 'stripe':
        // Real Stripe
        if (clientSecret && !clientSecret.startsWith('mock_secret_') && Elements && CheckoutForm) {
          return (
            <Elements stripe={getStripe()} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} onSuccessfulPayment={handleSuccess} />
            </Elements>
          );
        }
        // Mock/sandbox Stripe
        return (
          <MockCheckoutForm
            clientSecret={clientSecret || `mock_secret_${Date.now()}`}
            onSuccessfulPayment={handleSuccess}
            totalPrice={total}
          />
        );

      case 'paypal':
        return <PayPalCheckout amount={total} onSuccess={handleSuccess} onError={handlePaymentError} />;

      case 'paystack':
        return (
          <PaystackCheckout
            amount={total}
            email={userEmail}
            onSuccess={handleSuccess}
            onError={handlePaymentError}
          />
        );

      case 'flutterwave':
        return (
          <FlutterwaveCheckout
            amount={total}
            email={userEmail}
            name={userName}
            onSuccess={handleSuccess}
            onError={handlePaymentError}
          />
        );

      case 'braintree':
        return (
          <BraintreeCheckout
            amount={total}
            onSuccess={handleSuccess}
            onError={handlePaymentError}
            authToken={authToken}
          />
        );

      default:
        return <p className="payment-placeholder">Select a payment method above.</p>;
    }
  };

  /* ─── Guard: must have booking data ─── */
  if (!clientSecret || !total) {
    return (
      <div className="checkout-page-container">
        <div className="checkout-empty">
          <span className="checkout-empty-icon">🛒</span>
          <h2>No booking in progress</h2>
          <p>Please select a car and dates from the Showroom first.</p>
          <button className="checkout-back-btn" onClick={() => navigate('/showroom')}>
            Go to Showroom
          </button>
        </div>
      </div>
    );
  }

  /* ─── Calculate rental days for summary ─── */
  // Helper to safely parse and format ISO dates
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d) ? '' : d.toLocaleDateString();
  };

  // Calculate rental days safely
  const getRentalDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) return 0;
    const diff = end - start;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const rentalDays = getRentalDays();

  return (
    <div className="checkout-page-container">
      {/* ── Header ── */}
      <div className="checkout-header">
        <button className="checkout-back-link" onClick={() => navigate(-1)}>
          ← Back to Showroom
        </button>
        <h2 className="checkout-title">Complete Your Booking</h2>
      </div>

      <div className="checkout-layout">
        {/* ── Left: Payment ── */}
        <div className="checkout-payment-section">
          {/* Payment Method Selector */}
          <div className="payment-method-selector">
            <h3 className="section-label">Choose Payment Method</h3>
            <div className="payment-methods-grid">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  className={`payment-method-card ${paymentMethod === method.id ? 'active' : ''}`}
                  onClick={() => { setPaymentMethod(method.id); setPaymentError(null); }}
                >
                  <span className="pm-icon">{method.icon}</span>
                  <span className="pm-label">{method.label}</span>
                  <span className="pm-desc">{method.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error banner */}
          {paymentError && (
            <div className="payment-error-banner">
              <span>⚠️</span>
              <p>{paymentError}</p>
              <button onClick={() => setPaymentError(null)}>✕</button>
            </div>
          )}

          {/* Gateway form */}
          <div className="payment-form-wrapper">
            <Suspense fallback={<div className="payment-gateway-loading" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading payment form...</div>}>
              {renderPaymentForm()}
            </Suspense>
          </div>
        </div>

        {/* ── Right: Booking Summary ── */}
        <div className="checkout-summary-section">
          <div className="summary-card">
            <h3 className="section-label">Booking Summary</h3>

            <div className="summary-row">
              <span className="summary-label">Car</span>
              <span className="summary-value">#{carId}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Dates</span>
              <span className="summary-value">{formatDate(startDate)} → {formatDate(endDate)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Duration</span>
              <span className="summary-value">{rentalDays} day{rentalDays !== 1 ? 's' : ''}</span>
            </div>
            {selectedInsurance && (
              <div className="summary-row">
                <span className="summary-label">Insurance</span>
                <span className="summary-value insurance-badge">{selectedInsurance}</span>
              </div>
            )}
            {insuranceCost > 0 && (
              <div className="summary-row">
                <span className="summary-label">Insurance Cost</span>
                <span className="summary-value">${insuranceCost}</span>
              </div>
            )}

            <div className="summary-divider" />

            <div className="summary-row summary-total">
              <span className="summary-label">Total</span>
              <span className="summary-value">${total}</span>
            </div>
          </div>

          <div className="checkout-secure-badge">
            <span>🔒</span>
            <p>Your payment information is encrypted and secure. We never store your card details.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
