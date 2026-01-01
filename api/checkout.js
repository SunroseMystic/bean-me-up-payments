const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  const amount = Number(req.query.amount || 300);

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
    success_url: "https://YOUR-SITE.com/success",
    cancel_url: "https://YOUR-SITE.com/cancel",
  });

  res.redirect(303, session.url);
};


