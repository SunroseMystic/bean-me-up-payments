import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle account.updated event
  if (event.type === 'account.updated') {
    const account = event.data.object;
    
    if (account.charges_enabled && account.details_submitted) {
      try {
        await resend.emails.send({
          from: 'support@buymechocolate.co',
          to: 'vfosshop@gmail.com',
          subject: 'New Creator Signed Up!',
          html: `<p>A new creator has completed their account setup: ${account.id}</p>`,
        });
      } catch (error) {
        console.error('Failed to send admin notification:', error);
      }
    }
  }

  // Handle transfer.created event
  if (event.type === 'transfer.created') {
    const transfer = event.data.object;
    const connectedAccountId = transfer.destination;
    const amount = (transfer.amount / 100).toFixed(2);
    const currency = transfer.currency.toUpperCase();

    console.log('🔔 Transfer created event received:', transfer.id);
    console.log('📧 Connected account:', connectedAccountId);

    try {
const paymentIntent = await stripe.paymentIntents.retrieve(
  transfer.source_transaction
);

const creatorEmail = paymentIntent.metadata.creatorEmail;

console.log("📧 Creator email:", creatorEmail);

if (creatorEmail) {
  const emailResult = await resend.emails.send({
    from: "support@buymechocolate.co",
    to: creatorEmail,
    subject: "You got fuel! 🍫",
    html: `
      <h2>You received a donation!</h2>
      <p>Someone just tipped you ${currency} $${amount}</p>
      <p>The money is on its way to your account.</p>
    `,
  });

  console.log("✅ Email sent:", emailResult);
} else {
  console.log("❌ No creatorEmail found in metadata");
}

    } catch (error) {
      console.error('❌ Failed to send creator notification:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
  }

  res.status(200).json({ received: true });
}
