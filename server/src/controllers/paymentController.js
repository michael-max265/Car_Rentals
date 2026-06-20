import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Check if Stripe is configured or using standard placeholders
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey.startsWith('your_') || stripeKey === 'sk_test_placeholder') {
      console.log(`[Payment Simulation] Mock payment intent created for amount: $${(amount / 100).toFixed(2)}`);
      return res.json({
        clientSecret: `mock_secret_simulated_pi_${Math.random().toString(36).substring(7)}_${Date.now()}`,
        simulated: true,
      });
    }

    // Amount is expected to be in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
