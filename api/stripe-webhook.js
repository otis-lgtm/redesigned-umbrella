const Stripe = require('stripe');
const { kv } = require('@vercel/kv');

// Must disable Vercel's body parser — Stripe needs the raw body for signature verification
module.exports.config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).json({ error: 'Missing stripe-signature header.' });

  const rawBody = await getRawBody(req);

  let event;
  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature.' });
  }

  try {
    await handleEvent(event);
  } catch (err) {
    console.error('Webhook handler error:', err.message);
    // Return 500 so Stripe retries
    return res.status(500).json({ error: 'Handler failed.' });
  }

  return res.status(200).json({ received: true });
};

async function handleEvent(event) {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.mode !== 'subscription') break;
      const email = (session.customer_email || session.metadata?.email || '').toLowerCase();
      if (!email) break;
      await upsertSubscriber(email, {
        subscriptionId: session.subscription,
        status: 'active',
      });
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const email = await getEmailForCustomer(stripe, sub.customer);
      if (email) {
        await upsertSubscriber(email, { subscriptionId: sub.id, status: sub.status });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const email = await getEmailForCustomer(stripe, sub.customer);
      if (email) {
        await upsertSubscriber(email, { subscriptionId: sub.id, status: 'canceled' });
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const email = await getEmailForCustomer(stripe, invoice.customer);
      if (email) {
        await upsertSubscriber(email, { subscriptionId: invoice.subscription, status: 'past_due' });
      }
      break;
    }

    default:
      // Ignore unhandled event types
      break;
  }
}

async function upsertSubscriber(email, fields) {
  const existing = (await kv.get(`subscriber:${email}`)) || {};
  await kv.set(`subscriber:${email}`, {
    ...existing,
    ...fields,
    updatedAt: Date.now(),
    createdAt: existing.createdAt || Date.now(),
  });
}

async function getEmailForCustomer(stripe, customerId) {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer.deleted ? null : (customer.email || '').toLowerCase() || null;
  } catch {
    return null;
  }
}
