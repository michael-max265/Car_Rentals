import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ clientSecret, onSuccessfulPayment }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
    } else {
      setError(null);
      setProcessing(false);
      onSuccessfulPayment(payload.paymentIntent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 border border-gray-200 rounded-md">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Credit Card</label>
        <div className="p-3 border border-gray-300 rounded-md bg-white">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }} />
        </div>
      </div>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <button 
        disabled={processing || !stripe} 
        id="submit"
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        <span id="button-text">
          {processing ? 'Processing...' : 'Pay & Confirm Booking'}
        </span>
      </button>
    </form>
  );
};

export default CheckoutForm;
