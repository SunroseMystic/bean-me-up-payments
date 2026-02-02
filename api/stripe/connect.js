import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const account = await stripe.accounts.create({
    type: "standard",
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: "https://bean-me-up-payments.vercel.app/reauth",
    return_url: "https://bean-me-up-payments.vercel.app/success",
    type: "account_onboarding",
  });

  res.redirect(accountLink.url);
}

