import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "GET") {
  // allow browser click
} else if (req.method !== "POST") {
  return res.status(405).end();
}

  try {
    const account = await stripe.accounts.create({
      type: "express",
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: process.env.STRIPE_REFRESH_URL,
      return_url: process.env.STRIPE_RETURN_URL,
      type: "account_onboarding",
    });

   res.redirect(302, accountLink.url);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
