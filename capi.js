const crypto = require('crypto');

function sha256(str) {
  if (!str) return null;
  return crypto.createHash('sha256').update(str.trim().toLowerCase()).digest('hex');
}

module.exports = async (req, res) => {
  // Allow CORS
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
    const { email, phone, name, eventName = 'Purchase', value = 299.00 } = req.body || {};

    const PIXEL_ID = '4580191425629483';
    const ACCESS_TOKEN = 'EAAXqA6NGLn0BSZCfmaqtnkMRk1xB8sgAQutCyZArApTkSysfnPSQWAZCnFWbBMoBtpbFrhRWnpvb0FRJVseHcZBD4mvNXQ6dP68Nmd6OsWKe8B1AwrloS7gQQ73o7ztGyaobuf9purOuw22MI5AK0iFTOiolnC1fKEfSvzG555UON3mgJMFiPpEX2j1DSemH8AZDZD';

    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const userData = {
      client_ip_address: clientIp.split(',')[0].trim(),
      client_user_agent: userAgent
    };

    if (email) userData.em = [sha256(email)];
    if (phone) userData.ph = [sha256(phone.replace(/\D/g, ''))];
    if (name) userData.fn = [sha256(name.split(' ')[0])];

    const eventPayload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: 'https://courses.qubeetechsystems.in/success.html',
          user_data: userData,
          custom_data: {
            currency: 'INR',
            value: Number(value),
            content_name: 'Meta Ads Mastery 2026'
          }
        }
      ],
      access_token: ACCESS_TOKEN
    };

    const fbResponse = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload)
    });

    const result = await fbResponse.json();
    return res.status(200).json({ success: true, metaResponse: result });
  } catch (error) {
    console.error('CAPI Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
