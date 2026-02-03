import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const amount = parseInt(req.query.amount, 10);

    if (!amount || amount <= 0) {
      res.status(400).send("Missing or invalid amount");
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Buy Me Chocolate",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: "https://bean-me-up-payments.vercel.app/success",
      cancel_url: "https://bean-me-up-payments.vercel.app/cancel",
    });

    res.writeHead(303, { Location: session.url });
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


