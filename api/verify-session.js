const Stripe = require('stripe');
const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || '*');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query;
  if (!session_id || !session_id.startsWith('cs_')) {
    return res.status(400).json({ error: 'Missing or invalid session_id.' });
  }

  // Return already-minted token if this session was verified before (handles page refresh)
  const existing = await kv.get(`session:${session_id}`);
  if (existing) {
    const token = await kv.get(`token:${existing}`);
    if (token) {
      return res.status(200).json({
        unlockToken: existing,
        email: token.email,
        type: token.type,
      });
    }
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
    });
  } catch (err) {
    console.error('Stripe retrieve error:', err.message);
    return res.status(404).json({ error: 'Session not found.' });
  }

  // Confirm payment
  const isSubscription = session.mode === 'subscription';
  const paid = isSubscription
    ? session.subscription?.status === 'active'
    : session.payment_status === 'paid';

  if (!paid) {
    return res.status(402).json({ error: 'Payment not completed.' });
  }

  const email = (session.customer_email || session.metadata?.email || '').toLowerCase();
  const type = isSubscription ? 'subscription' : 'one_time';
  const unlockToken = crypto.randomUUID();

  // Store unlock token (1-hour TTL)
  await kv.set(`token:${unlockToken}`, { type, email, sessionId: session_id, createdAt: Date.now() }, { ex: 3600 });
  // Map session → token so refresh re-issues the same token
  await kv.set(`session:${session_id}`, unlockToken, { ex: 3600 });

  // Persist subscription record (no TTL — updated by webhooks)
  if (isSubscription && email) {
    await kv.set(`subscriber:${email}`, {
      subscriptionId: session.subscription.id,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  return res.status(200).json({ unlockToken, email, type });
};
