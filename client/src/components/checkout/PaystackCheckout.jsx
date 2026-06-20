import React from 'react';
import { usePaystackPayment } from 'react-paystack';

const PAYSTACK_PUBLIC_KEY = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;

/**
 * PaystackCheckout – renders a "Pay with Paystack" button.
 * Props: amount (number, USD), email (string), onSuccess(ref), onError(err)
 *
 * NOTE: Paystack amounts are in the smallest currency unit (kobo for NGN, cents for USD).
 * We multiply by 100 to convert dollars to cents.
 */

function PaystackLiveButton({ amount, email, onSuccess, onError }) {
  const config = {
    reference: `PSK_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    email,
    amount: Math.round(amount * 100), // cents
    publicKey: PAYSTACK_PUBLIC_KEY,
    currency: 'USD',
  };

  const initializePayment = usePaystackPayment(config);

  const handleClick = () => {
    initializePayment(
      (reference) => {
        // Payment succeeded
        onSuccess({
          id: reference.reference || reference.trxref,
          status: 'success',
          reference: reference.reference || reference.trxref,
          provider: 'paystack',
        });
      },
      () => {
        // Payment window closed
        onError?.(new Error('Paystack payment was cancelled.'));
      }
    );
  };

  return (
    <div className="gateway-live-box">
      <button className="gateway-live-btn paystack" onClick={handleClick}>
        <span className="gateway-btn-icon">💳</span>
        Pay ${amount.toFixed(2)} with Paystack
      </button>
    </div>
  );
}

export default function PaystackCheckout({ amount, email, onSuccess, onError }) {
  if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.startsWith('pk_test_paystack_placeholder')) {
    return (
      <div className="gateway-mock-box">
        <h4>Paystack Configuration Missing</h4>
        <p className="gateway-mock-hint text-red-500">
          Please add your real Paystack public key to <code>REACT_APP_PAYSTACK_PUBLIC_KEY</code> in the client <code>.env</code> file.
        </p>
      </div>
    );
  }

  /* ── Real Paystack integration ── */
  return <PaystackLiveButton amount={amount} email={email} onSuccess={onSuccess} onError={onError} />;
}
