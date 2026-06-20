/**
 * Braintree Controller – handles Braintree client token generation and checkout.
 * Uses sandbox simulation when no real Braintree credentials are configured.
 */

export const getBraintreeToken = async (req, res) => {
  try {
    const merchantId = process.env.BRAINTREE_MERCHANT_ID;
    const publicKey = process.env.BRAINTREE_PUBLIC_KEY;
    const privateKey = process.env.BRAINTREE_PRIVATE_KEY;

    if (
      !merchantId ||
      merchantId.startsWith('sandbox_merchant_placeholder') ||
      merchantId.startsWith('your_')
    ) {
      console.log('[Braintree Simulation] Returning mock client token');
      return res.json({
        clientToken: `mock_braintree_client_token_${Date.now()}`,
        simulated: true,
      });
    }

    // Real Braintree token generation
    // NOTE: This requires the braintree npm package on the server
    // npm install braintree
    const braintree = await import('braintree');
    const gateway = new braintree.BraintreeGateway({
      environment: braintree.Environment.Sandbox,
      merchantId,
      publicKey,
      privateKey,
    });

    const response = await gateway.clientToken.generate({});
    res.json({ clientToken: response.clientToken });
  } catch (error) {
    console.error('Braintree token error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const processBraintreeCheckout = async (req, res) => {
  try {
    const { nonce, amount } = req.body;

    const merchantId = process.env.BRAINTREE_MERCHANT_ID;
    const publicKey = process.env.BRAINTREE_PUBLIC_KEY;
    const privateKey = process.env.BRAINTREE_PRIVATE_KEY;

    if (
      !merchantId ||
      merchantId.startsWith('sandbox_merchant_placeholder') ||
      merchantId.startsWith('your_')
    ) {
      console.log(`[Braintree Simulation] Mock checkout for $${amount} with nonce: ${nonce}`);
      return res.json({
        success: true,
        transactionId: `BT_MOCK_TXN_${Date.now()}`,
        simulated: true,
      });
    }

    // Real Braintree transaction
    const braintree = await import('braintree');
    const gateway = new braintree.BraintreeGateway({
      environment: braintree.Environment.Sandbox,
      merchantId,
      publicKey,
      privateKey,
    });

    const result = await gateway.transaction.sale({
      amount: amount.toString(),
      paymentMethodNonce: nonce,
      options: { submitForSettlement: true },
    });

    if (result.success) {
      res.json({
        success: true,
        transactionId: result.transaction.id,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    console.error('Braintree checkout error:', error);
    res.status(500).json({ error: error.message });
  }
};
