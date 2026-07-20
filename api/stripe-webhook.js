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

// Tries both webhook secrets, since this endpoint receives events from two
// separate Stripe destinations (your account, and connected accounts) that
// each sign with their own secret.
function verifyEvent(buf, sig) {
  const secrets = [process.env.STRIPE_WEBHOOK_SECRET, process.env.STRIPE_WEBHOOK_SECRET_CONNECT];

  for (const secret of secrets) {
    if (!secret) continue;
    try {
      return stripe.webhooks.constructEvent(buf, sig, secret);
    } catch (err) {
      // try the next secret
    }
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  const event = verifyEvent(buf, sig);

  if (!event) {
    console.error('Webhook signature verification failed against all known secrets');
    return res.status(400).send('Webhook Error: signature verification failed');
  }

  // Handle payment_intent.succeeded from connected accounts
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const connectedAccountId = event.account; // This is the creator's account ID
    
    let creatorEmail = null;
    if (connectedAccountId) {
      try {
        const accountDetails = await stripe.accounts.retrieve(connectedAccountId);
        creatorEmail = accountDetails.email || accountDetails.business_profile?.support_email;
      } catch (stripeError) {
        console.error('Stripe account lookup failed:', stripeError);
      }
    }

    const amount = (paymentIntent.amount / 100).toFixed(2);
    const currency = paymentIntent.currency.toUpperCase();

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
        console.log('Fuel email sent to:', creatorEmail);
      } catch (error) {
        console.error('Failed to send email:', error);
      }
    } else {
      console.error('No creator email found for account:', connectedAccountId);
    }
  }

  // Handle account.updated - fires when a creator completes Stripe Connect onboarding
  if (event.type === 'account.updated') {
    const account = event.data.object;

    // Only notify once, when they've actually finished onboarding
    if (account.details_submitted) {
      try {
        await resend.emails.send({
          from: "support@buymechocolate.co",
          to: "support@buymechocolate.co", // sends to YOU, not the creator
          subject: "New Creator Signed Up! 🥥",
          html: `
            <h2>New Creator Signed Up!</h2>
            <p>A new creator completed onboarding.</p>
            <p><strong>Account ID:</strong> ${account.id}</p>
            <p><strong>Email:</strong> ${account.email || 'not provided'}</p>
          `,
        });
        console.log('New creator signup email sent for:', account.id);
      } catch (error) {
        console.error('Failed to send new creator email:', error);
      }
    }
  }
  
  // Keep your existing checkout.session.completed handler
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    const creatorEmail = session.metadata?.creatorEmail;

    const amount = (session.amount_total / 100).toFixed(2);
    const currency = session.currency.toUpperCase();

    if (creatorEmail) {
      try {
        await resend.emails.send({
          from: "support@buymechocolate.co",
          to: creatorEmail,
          subject: "You've got fuel! 🍫",
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
