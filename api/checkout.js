import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // 1. Only allow Shopify POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // 2. Read the total price directly from Shopify's data body
    const totalOrderAmount = parseFloat(req.body.total_price);

    if (!totalOrderAmount || totalOrderAmount <= 0) {
      return res.status(400).send("Missing or invalid amount from Shopify");
    }

    // 3. Calculate your 3% tip jar cut (converted to cents for Stripe)
    const tipJarCutInCents = Math.round(totalOrderAmount * 0.03 * 100);

    const CONNECTED_ACCOUNT_ID = process.env.STRIPE_CONNECT_ACCOUNT_ID;

    // 4. Directly transfer the money to your Stripe account without a checkout page
    const transfer = await stripe.transfers.create({
      amount: tipJarCutInCents,
      currency: "usd",
      destination: CONNECTED_ACCOUNT_ID,
      description: `3% Tip Jar Cut for Shopify Order #${req.body.order_number || ''}`,
    });

    return res.status(200).json({ success: true, transferId: transfer.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}




