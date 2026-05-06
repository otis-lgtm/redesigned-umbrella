const { kv } = require('@vercel/kv');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || '*');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const email = (req.query.email || '').toLowerCase().trim();
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  let record;
  try {
    record = await kv.get(`subscriber:${email}`);
  } catch (err) {
    console.error('KV read error:', err.message);
    return res.status(500).json({ error: 'Could not check subscription status.' });
  }

  if (!record || record.status !== 'active') {
    return res.status(200).json({ active: false });
  }

  // Mint a fresh short-lived unlock token for this subscriber
  const unlockToken = crypto.randomUUID();
  await kv.set(`token:${unlockToken}`, {
    type: 'subscription',
    email,
    createdAt: Date.now(),
  }, { ex: 3600 });

  return res.status(200).json({ active: true, unlockToken, email });
};
