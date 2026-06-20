import express from 'express';
import { createPaymentIntent } from '../controllers/paymentController.js';
import { createPayPalOrder, capturePayPalOrder } from '../controllers/paypalController.js';
import { initializePaystack, verifyPaystack } from '../controllers/paystackController.js';
import { initializeFlutterwave, verifyFlutterwave } from '../controllers/flutterwaveController.js';
import { getBraintreeToken, processBraintreeCheckout } from '../controllers/braintreeController.js';

const router = express.Router();

// ── Stripe ──
router.post('/create-payment-intent', createPaymentIntent);

// ── PayPal ──
router.post('/paypal/create-order', createPayPalOrder);
router.post('/paypal/capture-order', capturePayPalOrder);

// ── Paystack ──
router.post('/paystack/initialize', initializePaystack);
router.get('/paystack/verify/:reference', verifyPaystack);

// ── Flutterwave ──
router.post('/flutterwave/initialize', initializeFlutterwave);
router.get('/flutterwave/verify/:transactionId', verifyFlutterwave);

// ── Braintree ──
router.get('/braintree/token', getBraintreeToken);
router.post('/braintree/checkout', processBraintreeCheckout);

export default router;
