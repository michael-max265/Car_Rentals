import React, { useState, useEffect, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const BRAINTREE_KEY = process.env.REACT_APP_BRAINTREE_TOKENIZATION_KEY;

/**
 * BraintreeCheckout – renders Braintree Drop-In UI.
 * Props: amount (number, USD), onSuccess(details), onError(err), authToken (Firebase ID token)
 */
export default function BraintreeCheckout({ amount, onSuccess, onError, authToken }) {
  const isMissingKey = !BRAINTREE_KEY || BRAINTREE_KEY.startsWith('sandbox_placeholder');

  const [dropInInstance, setDropInInstance] = useState(null);
  const [clientToken, setClientToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const dropInContainerRef = useRef(null);

  /* ── Fetch client token from backend ── */
  useEffect(() => {
    let isMounted = true;
    if (isMissingKey) return;

    const fetchToken = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/payments/braintree/token`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
        const data = await res.json();
        if (isMounted) setClientToken(data.clientToken);
      } catch (err) {
        console.error('Failed to fetch Braintree client token', err);
        if (isMounted) onError?.(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchToken();
    return () => { isMounted = false; };
  }, [isMissingKey, authToken, onError]);

  /* ── Initialize Drop-In when client token is ready ── */
  useEffect(() => {
    let isMounted = true;
    if (!clientToken || isMissingKey || !dropInContainerRef.current) return;

    let instance = null;

    const initDropIn = async () => {
      try {
        const dropIn = await import('braintree-web-drop-in');
        instance = await dropIn.create({
          authorization: clientToken,
          container: dropInContainerRef.current,
          card: {
            cardholderName: { required: true },
          },
        });
        if (isMounted) {
          setDropInInstance(instance);
        } else {
          // If unmounted while creating, teardown immediately
          instance.teardown().catch(() => {});
        }
      } catch (err) {
        console.error('Braintree Drop-In init error', err);
        if (isMounted) onError?.(err);
      }
    };

    initDropIn();

    return () => {
      isMounted = false;
      if (instance) {
        instance.teardown().catch(() => {});
      }
    };
  }, [clientToken, isMissingKey, onError]);

  const handlePay = async () => {
    if (!dropInInstance) return;

    setProcessing(true);
    try {
      const { nonce } = await dropInInstance.requestPaymentMethod();

      // Send nonce to backend for processing
      const res = await fetch(`${API_URL}/api/payments/braintree/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ nonce, amount }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess({
          id: data.transactionId || `BT_${Date.now()}`,
          status: 'completed',
          nonce,
          provider: 'braintree',
        });
      } else {
        onError?.(new Error(data.error || 'Braintree checkout failed'));
      }
    } catch (err) {
      console.error('Braintree payment error', err);
      onError?.(err);
    } finally {
      setProcessing(false);
    }
  };

  if (isMissingKey) {
    return (
      <div className="gateway-mock-box">
        <h4>Braintree Configuration Missing</h4>
        <p className="gateway-mock-hint text-red-500">
          Please add your real Braintree tokenization key to <code>REACT_APP_BRAINTREE_TOKENIZATION_KEY</code> in the client <code>.env</code> file.
        </p>
      </div>
    );
  }

  /* ── Real Braintree Drop-In ── */
  return (
    <div className="gateway-live-box braintree-container">
      {loading && <p className="gateway-loading">Loading Braintree…</p>}
      <div ref={dropInContainerRef} className="braintree-dropin" />
      {dropInInstance && (
        <button
          className="gateway-live-btn braintree"
          onClick={handlePay}
          disabled={processing}
        >
          {processing ? 'Processing…' : `Pay $${amount.toFixed(2)} with Braintree`}
        </button>
      )}
    </div>
  );
}
