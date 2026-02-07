export default async function handler(req, res) {
  if (req.method !== "GET") {
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

    return res.redirect(302, accountLink.url);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}
