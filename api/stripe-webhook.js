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

  // Handle a successful donor transaction
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const creatorEmail = session.metadata.creatorEmail;
    const amount = (session.amount_total / 100).toFixed(2);
    const currency = session.currency.toUpperCase();

    if (creatorEmail) {
      try {
        await resend.emails.send({
          from: "support@buymechocolate.co",
          to: creatorEmail,
          subject: "You got fuel! 🍫",
          html: `
            <h2>You've got fuel!</h2>
            <p>Your sidekick just collected ${currency} $${amount} to keep your fuel high and energy going.</p>
            <p>Keep doing what you do, they see you!</p>
            <p>Buy Me Chocolate</p>
          `,
        });
      } catch (error) {
        console.error('Failed to send email:', error);
      }
     }
  }

  res.status(200).json({ received: true });
}

