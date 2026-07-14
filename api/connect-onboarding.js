import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  const botSignals = ["bot", "crawl", "spider", "slurp", "facebookexternalhit", "slackbot", "whatsapp", "preview", "headless"];
  if (botSignals.some((signal) => userAgent.includes(signal))) {
    return res.status(403).end();
  }

  try {
    const account = await stripe.accounts.create({
      type: "express",
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: process.env.STRIPE_REFRESH_URL,
      return_url: process.env.STRIPE_RETURN_URL,
      type: "account_onboarding",
    });

    return res.redirect(302, accountLink.url);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
