module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const KEY_ID = 'rzp_live_ToVknbUG7BuLYL';
    const KEY_SECRET = 'V6LdP62mu5HhJdShEWkvbt40';

    // Amount for testing: 100 paise = ₹1.00
    const amountInPaise = 100;

    const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      })
    });

    const orderData = await response.json();

    if (!response.ok) {
      console.error('Razorpay Order Error:', orderData);
      return res.status(response.status).json({ error: orderData });
    }

    return res.status(200).json({
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId: KEY_ID
    });
  } catch (error) {
    console.error('Server error creating order:', error);
    return res.status(500).json({ error: error.message });
  }
};
