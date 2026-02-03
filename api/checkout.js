import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const amountParam = req.query.amount;
    const dollars = Number(amountParam);

    if (!dollars || dollars <= 0) {
      return res.status(400).send("Missing or invalid amount");
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
            unit_amount: Math.round(dollars * 100),
          },
          quantity: 1,
        },
      ],
      success_url: "https://bean-me-up-payments.vercel.app/success",
      cancel_url: "https://bean-me-up-payments.vercel.app/cancel",
    });

    res.redirect(303, session.url);
  } catch (err) {
    res.status(500).send(err.message);
  }
}


