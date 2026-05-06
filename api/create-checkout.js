const Stripe = require('stripe');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TIERS = {
  once: { mode: 'payment',      priceEnvKey: 'STRIPE_PRICE_ID_ONCE' },
  sub:  { mode: 'subscription', priceEnvKey: 'STRIPE_PRICE_ID_SUB'  },
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, tier } = req.body || {};

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  const tierConfig = TIERS[tier];
  if (!tierConfig) {
    return res.status(400).json({ error: 'Invalid tier. Use "once" or "sub".' });
  }

  const priceId = process.env[tierConfig.priceEnvKey];
  if (!priceId) {
    console.error('Missing env var:', tierConfig.priceEnvKey);
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const appUrl = process.env.APP_URL;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: tierConfig.mode,
      payment_method_types: ['card'],
      customer_email: email.toLowerCase(),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/?cancelled=1`,
      metadata: { email: email.toLowerCase() },
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return res.status(500).json({ error: 'Could not create checkout session. Please try again.' });
  }
};
