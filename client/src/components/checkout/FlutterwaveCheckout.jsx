import React from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

const FLUTTERWAVE_PUBLIC_KEY = process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY;

/**
 * FlutterwaveCheckout – renders a "Pay with Flutterwave" button.
 * Props: amount (number, USD), email (string), name (string),
 *        onSuccess(details), onError(err)
 */

function FlutterwaveLiveButton({ amount, email, name, onSuccess, onError }) {
  const config = {
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `FLW_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    amount,
    currency: 'USD',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email,
      name: name || 'Customer',
    },
    customizations: {
      title: 'Car Rental Payment',
      description: 'Payment for car rental booking',
      logo: '', // Can add your logo URL here
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const handleClick = () => {
    handleFlutterPayment({
      callback: (response) => {
        closePaymentModal();
        if (response.status === 'successful' || response.status === 'completed') {
          onSuccess({
            id: response.transaction_id?.toString() || response.tx_ref,
            status: response.status,
            reference: response.tx_ref,
            flw_ref: response.flw_ref,
            provider: 'flutterwave',
          });
        } else {
          onError?.(new Error(`Flutterwave payment status: ${response.status}`));
        }
      },
      onClose: () => {
        // User closed the modal
      },
    });
  };

  return (
    <div className="gateway-live-box">
      <button className="gateway-live-btn flutterwave" onClick={handleClick}>
        <span className="gateway-btn-icon">🦋</span>
        Pay ${amount.toFixed(2)} with Flutterwave
      </button>
    </div>
  );
}

export default function FlutterwaveCheckout({ amount, email, name, onSuccess, onError }) {
  if (!FLUTTERWAVE_PUBLIC_KEY || FLUTTERWAVE_PUBLIC_KEY.startsWith('FLWPUBK_TEST_placeholder')) {
    return (
      <div className="gateway-mock-box">
        <h4>Flutterwave Configuration Missing</h4>
        <p className="gateway-mock-hint text-red-500">
          Please add your real Flutterwave public key to <code>REACT_APP_FLUTTERWAVE_PUBLIC_KEY</code> in the client <code>.env</code> file.
        </p>
      </div>
    );
  }

  /* ── Real Flutterwave integration ── */
  return (
    <FlutterwaveLiveButton
      amount={amount}
      email={email}
      name={name}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}
