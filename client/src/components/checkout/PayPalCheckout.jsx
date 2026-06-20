import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;

/**
 * PayPalCheckout – renders PayPal Smart Buttons.
 * Props: amount (number, USD), onSuccess(details), onError(err)
 */
export default function PayPalCheckout({ amount, onSuccess, onError }) {
  /* ── Real PayPal integration ── */
  return (
    <div className="gateway-live-box">
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID || 'test', currency: 'USD' }}>
        <PayPalButtons
          style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
          createOrder={(_data, actions) =>
            actions.order.create({
              purchase_units: [{ amount: { value: amount.toFixed(2) } }],
            })
          }
          onApprove={async (_data, actions) => {
            try {
              const details = await actions.order.capture();
              onSuccess({
                id: details.id,
                status: details.status,
                payer: details.payer,
                purchase_units: details.purchase_units,
              });
            } catch (err) {
              console.error('PayPal capture error', err);
              onError?.(err);
            }
          }}
          onError={(err) => {
            console.error('PayPal error', err);
            onError?.(err);
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
