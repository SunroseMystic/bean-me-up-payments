const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount } = req.body;

    const allowedAmounts = [300, 500, 1000, 2500];
    if (!allowedAmounts.includes(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const destination = process.env.STRIPE_CONNECT_DESTINATION_ACCOUNT;
    const platformAccount = process.env.STRIPE_CONNECT_ACCOUNT_ID;

    if (!destination || !destination.startsWith("acct_")) {
      return res.status(500).json({
        error:
          "Server misconfigured: STRIPE_CONNECT_DESTINATION_ACCOUNT is missing or invalid.",
      });
    }

    // HARD SAFETY CHECK: never allow destination to be the platform account
    if (platformAccount && destination === platformAccount) {
      return res.status(500).json({
        error:
          "Server misconfigured: destination account cannot be the platform account.",
      });
    }

    const platformCut = Math.round(amount * 0.03);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      application_fee_amount: platformCut,
      transfer_data: {
        destination,
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("create-payment-intent error:", err);
    return res.status(500).json({ error: err.message });
  }
};

