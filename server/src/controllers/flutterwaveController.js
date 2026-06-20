/**
 * Flutterwave Controller – handles Flutterwave payment initialization and verification.
 * Uses sandbox simulation when no real Flutterwave credentials are configured.
 */

export const initializeFlutterwave = async (req, res) => {
  try {
    const { amount, email, name, tx_ref } = req.body;

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

    if (!secretKey || secretKey.startsWith('FLWSECK_TEST_placeholder') || secretKey.startsWith('your_')) {
      console.log(`[Flutterwave Simulation] Mock payment for $${amount} to ${email}`);
      return res.json({
        status: 'success',
        data: {
          link: 'https://checkout.flutterwave.com/mock',
          tx_ref: tx_ref || `FLW_MOCK_${Date.now()}`,
        },
        simulated: true,
      });
    }

    // Real Flutterwave API call
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: tx_ref || `FLW_${Date.now()}`,
        amount,
        currency: 'USD',
        redirect_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/callback`,
        customer: { email, name: name || 'Customer' },
        payment_options: 'card,mobilemoney,ussd',
        customizations: {
          title: 'Car Rental Payment',
          description: 'Payment for car rental booking',
        },
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Flutterwave initialization error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const verifyFlutterwave = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

    if (!secretKey || secretKey.startsWith('FLWSECK_TEST_placeholder') || secretKey.startsWith('your_')) {
      console.log(`[Flutterwave Simulation] Mock verification for txn: ${transactionId}`);
      return res.json({
        status: 'success',
        data: {
          id: transactionId,
          status: 'successful',
          amount: 0,
          currency: 'USD',
        },
        simulated: true,
      });
    }

    // Real Flutterwave verification
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Flutterwave verification error:', error);
    res.status(500).json({ error: error.message });
  }
};
