const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  const amount = parseInt(req.query.amount, 10);

if (!amount || amount <= 0) {
  return res.status(400).send("Missing or invalid amount");
}

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Support a Creator" },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    success_url: "https://bean-me-up-payments.vercel.app/success",
    cancel_url: "https://bean-me-up-payments.vercel.app/cancel",
  });

  res.redirect(303, session.url);
};


