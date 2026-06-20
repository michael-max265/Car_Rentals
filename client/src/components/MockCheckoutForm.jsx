import React, { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import './MockCheckoutForm.css';

export default function MockCheckoutForm({ clientSecret, onSuccessfulPayment, totalPrice }) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFillDemo = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvv('123');
    const profile = useAuthStore.getState().profile;
    setCardName(profile?.name || 'Jane Doe');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      setError('Please fill in all credit card details.');
      return;
    }
    setError(null);
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      onSuccessfulPayment({
        id: `pi_mock_${Math.random().toString(36).substring(7)}_${Date.now()}`,
      });
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="mock-checkout-form">
      <div className="mock-checkout-header">
        <span className="mock-checkout-badge">⚠️ Simulated Sandbox Checkout</span>
        <button type="button" onClick={handleFillDemo} className="mock-checkout-fill-btn">
          ✨ Autofill Test Card
        </button>
      </div>

      {error && <div className="mock-checkout-error">{error}</div>}

      <div className="mock-checkout-card-preview">
        <div className="mock-card-branding">
          <span className="mock-card-type">Mock Card</span>
          <span className="mock-card-chip">📟</span>
        </div>
        <div className="mock-card-number">
          {cardNumber || '•••• •••• •••• ••••'}
        </div>
        <div className="mock-card-details">
          <div>
            <span className="mock-card-label">CARDHOLDER</span>
            <span className="mock-card-value">{cardName.toUpperCase() || 'JANE DOE'}</span>
          </div>
          <div>
            <span className="mock-card-label">EXPIRES</span>
            <span className="mock-card-value">{cardExpiry || 'MM/YY'}</span>
          </div>
        </div>
      </div>

      <div className="mock-checkout-fields">
        <div className="mock-field">
          <label htmlFor="card-name-input">Cardholder Name</label>
          <input
            id="card-name-input"
            type="text"
            placeholder="Jane Doe"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            required
          />
        </div>

        <div className="mock-field">
          <label htmlFor="card-number-input">Card Number</label>
          <input
            id="card-number-input"
            type="text"
            maxLength="19"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
              const matches = val.match(/\d{4,16}/g);
              const match = (matches && matches[0]) || '';
              const parts = [];
              for (let i = 0, len = match.length; i < len; i += 4) {
                parts.push(match.substring(i, i + 4));
              }
              if (parts.length > 0) {
                setCardNumber(parts.join(' '));
              } else {
                setCardNumber(val);
              }
            }}
            required
          />
        </div>

        <div className="mock-row">
          <div className="mock-field">
            <label htmlFor="card-expiry-input">Expiration Date</label>
            <input
              id="card-expiry-input"
              type="text"
              maxLength="5"
              placeholder="MM/YY"
              value={cardExpiry}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length >= 2) {
                  setCardExpiry(val.substring(0, 2) + '/' + val.substring(2, 4));
                } else {
                  setCardExpiry(val);
                }
              }}
              required
            />
          </div>

          <div className="mock-field">
            <label htmlFor="card-cvv-input">CVV</label>
            <input
              id="card-cvv-input"
              type="password"
              maxLength="3"
              placeholder="123"
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
              required
            />
          </div>
        </div>
      </div>

      <button disabled={processing} type="submit" className="mock-checkout-btn">
        {processing ? (
          <span className="mock-spinner-container">
            <span className="mock-spinner"></span> Processing Demo Transaction...
          </span>
        ) : (
          `Pay $${totalPrice} & Confirm Booking`
        )}
      </button>
      <p className="mock-disclaimer">
        This is a secure simulation sandbox. No real money will be charged.
      </p>
    </form>
  );
}
