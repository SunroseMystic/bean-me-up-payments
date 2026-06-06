import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    // Read the raw chunk data stream directly for Stripe verification
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const rawBody = Buffer.concat(chunks);

    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'account.updated') {
    const account = event.data.object;

    if (account.charges_enabled && account.details_submitted) {
      const accountId = account.id;

      try {
        await resend.emails.send({
          from: 'support@buymechocolate.co',
          to: 'vfosshop@gmail.com',
          subject: 'New Creator Signed Up!',
          html: `<p>A new creator completed onboarding.</p><p><strong>Account ID:</strong> ${accountId}</p>`,
        });
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }
    }
  }

  res.json({ received: true });
}
