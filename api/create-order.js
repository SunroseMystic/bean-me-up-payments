export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      paymentIntentId,
      amount,
      customerEmail,
      note,
      testMode = true
    } = req.body || {};

    if (!paymentIntentId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Safety response for now (no Shopify charge here)
    // This confirms your flow reached step 2 after Stripe payment success.
    return res.status(200).json({
      ok: true,
      message: "Order endpoint reached",
      received: {
        paymentIntentId,
        amount,
        customerEmail: customerEmail || null,
        note: note || null,
        testMode
      }
    });
  } catch (err) {
    console.error("create-order error:", err);
    return res.status(500).json({ error: err.message });
  }
}
