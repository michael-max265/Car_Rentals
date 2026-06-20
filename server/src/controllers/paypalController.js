/**
 * PayPal Controller – handles PayPal order creation and capture.
 * Uses sandbox simulation when no real PayPal credentials are configured.
 */

export const createPayPalOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    // Check if PayPal is configured
    if (!clientId || clientId.startsWith('sandbox_paypal_placeholder') || clientId.startsWith('your_')) {
      console.log(`[PayPal Simulation] Mock order created for amount: $${amount}`);
      return res.json({
        orderId: `PAYPAL_MOCK_ORDER_${Date.now()}`,
        simulated: true,
      });
    }

    // Real PayPal API call (REST API v2)
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const tokenData = await tokenRes.json();

    const orderRes = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: 'USD', value: amount.toString() } }],
      }),
    });
    const orderData = await orderRes.json();

    res.json({ orderId: orderData.id });
  } catch (error) {
    console.error('PayPal create order error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const capturePayPalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || clientId.startsWith('sandbox_paypal_placeholder') || clientId.startsWith('your_')) {
      console.log(`[PayPal Simulation] Mock capture for order: ${orderId}`);
      return res.json({
        id: orderId,
        status: 'COMPLETED',
        simulated: true,
      });
    }

    // Real PayPal capture
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const tokenData = await tokenRes.json();

    const captureRes = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    const captureData = await captureRes.json();

    res.json({
      id: captureData.id,
      status: captureData.status,
    });
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ error: error.message });
  }
};
