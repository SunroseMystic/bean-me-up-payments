const Stripe = require("stripe");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks);

  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
if (event.type === "account.updated") {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: 'onboarding@crisoupvro.resend.app',
        to: 'vfosshop@gmail.com',
          subject: '🚀 New Creator Onboarded!',
          text: 'A new creator just finished signing up! Check Stripe Connect to give them their Donation page.',
        });
      } catch (emailErr) {
        console.error("Email failed to send:", emailErr);
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    res.status(400).send("Webhook Error");
  }
};


