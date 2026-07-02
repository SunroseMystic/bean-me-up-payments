import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const totalOrderAmount = parseFloat(req.body.total_price);

    if (!totalOrderAmount || totalOrderAmount <= 0) {
      return res.status(400).send("Missing or invalid amount from Shopify");
    }

    const amountInCents = Math.round(totalOrderAmount * 100);
    const platformFee = Math.round(amountInCents * 0.03);

    const connectedAccount =
      process.env.STRIPE_CONNECT_DESTINATION_ACCOUNT;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },

      application_fee_amount: platformFee,

      transfer_data: {
        destination: connectedAccount,
      },

      description: `Shopify Order #${req.body.order_number || ""}`,
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message,
    });
  }
}





