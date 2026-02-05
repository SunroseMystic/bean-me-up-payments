import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const amount = parseInt(req.query.amount, 10);

    if (!amount || amount <= 0) {
      return res.status(400).send("Missing or invalid amount");
    }

    // TEMP until creators connect:
    // later this will be a real connected account ID like acct_123
    const CONNECTED_ACCOUNT_ID = process.env.STRIPE_CONNECT_ACCOUNT_ID;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Support a Creator",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],

      payment_intent_data: {
        transfer_data: {
          destination: CONNECTED_ACCOUNT_ID,
        },
      },
success_url: "https://bean-me-up-payments.vercel.app/api/success",
cancel_url: "https://bean-me-up-payments.vercel.app/api/cancel",
    });

    res.redirect(303, session.url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



