import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, destination } = req.body || {};

    const allowedAmounts = [300, 500, 1000, 2500];

    if (!allowedAmounts.includes(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (!destination || !destination.startsWith("acct_")) {
      return res.status(400).json({ error: "Invalid destination account" });
    }

    // 3% goes to your platform
    const platformCut = Math.round(amount * 0.03);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation"
            },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      payment_intent_data: {
        application_fee_amount: platformCut,
        transfer_data: {
          destination
        }
      },
      success_url: "https://fuel.buymechocolate.co/success.html",
      cancel_url: `https://fuel.buymechocolate.co/donate.html?dest=${encodeURIComponent(destination)}`
    });

    return res.status(200).json({
      url: session.url
    });

  } catch (err) {
    console.error("checkout error:", err);
    return res.status(500).json({
      error: err.message
    });
  }
}






