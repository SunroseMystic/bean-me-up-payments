import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, destination } = req.body || {};

    // Allow any donation of $3.00 or more (amount is in cents)
    if (!Number.isInteger(amount) || amount < 300) {
      return res.status(400).json({
        error: "Minimum donation is $3.00"
      });
    }

    // Require a valid Stripe Connect account
    if (!destination || !destination.startsWith("acct_")) {
      return res.status(400).json({
        error: "Invalid destination account"
      });
    }

    // Platform fee (3%)
    const platformCut = Math.round(amount * 0.03);

    // Create Stripe Checkout Session
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

      success_url: "https://fuel.buymechocolate.co/api/success",

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







