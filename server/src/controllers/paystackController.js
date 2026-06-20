/**
 * Paystack Controller – handles Paystack transaction initialization and verification.
 * Uses sandbox simulation when no real Paystack credentials are configured.
 */

export const initializePaystack = async (req, res) => {
  try {
    const { amount, email } = req.body;

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey || secretKey.startsWith('sk_test_paystack_placeholder') || secretKey.startsWith('your_')) {
      console.log(`[Paystack Simulation] Mock transaction for $${amount} to ${email}`);
      return res.json({
        status: true,
        data: {
          authorization_url: 'https://checkout.paystack.com/mock',
          access_code: `PSK_MOCK_AC_${Date.now()}`,
          reference: `PSK_MOCK_REF_${Date.now()}`,
        },
        simulated: true,
      });
    }

    // Real Paystack API call
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Paystack expects amount in smallest unit
        email,
        currency: 'USD',
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Paystack initialization error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const verifyPaystack = async (req, res) => {
  try {
    const { reference } = req.params;

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey || secretKey.startsWith('sk_test_paystack_placeholder') || secretKey.startsWith('your_')) {
      console.log(`[Paystack Simulation] Mock verification for ref: ${reference}`);
      return res.json({
        status: true,
        data: {
          status: 'success',
          reference,
          amount: 0,
          currency: 'USD',
        },
        simulated: true,
      });
    }

    // Real Paystack verification
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Paystack verification error:', error);
    res.status(500).json({ error: error.message });
  }
};
