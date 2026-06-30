  import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const totalOrderAmount = parseFloat(req.body.total_price);

    if (!totalOrderAmount || totalOrderAmount <= 0) {
      return res.status(400).send("Missing or invalid amount from Shopify");
    }

    const tipJarCutInCents = Math.round(totalOrderAmount * 0.03 * 100);
    const CONNECTED_ACCOUNT_ID = process.env.STRIPE_CONNECT_ACCOUNT_ID;

    // Creates a secure payment intent attached to your connect account
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tipJarCutInCents,
      currency: "usd",
      payment_method_types: ["card"],
      description: `3% Tip Jar Cut for Shopify Order #${req.body.order_number || ''}`,
      application_fee_amount: 0,
      transfer_data: {
        destination: CONNECTED_ACCOUNT_ID,
      },
    });

    return res.status(200).json({ success: true, intentId: paymentIntent.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}




