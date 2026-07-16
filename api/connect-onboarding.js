import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

async function verifyTurnstile(token, remoteIp) {
  if (!token) return false;

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: TURNSTILE_SECRET,
      response: token,
      remoteip: remoteIp || "",
    }),
  });

  const data = await res.json();
  return data.success === true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  const botSignals = ["bot", "crawl", "spider", "slurp", "facebookexternalhit", "slackbot", "whatsapp", "preview", "headless"];
  if (botSignals.some((signal) => userAgent.includes(signal))) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { turnstileToken } = req.body || {};
  const remoteIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim();

  const verified = await verifyTurnstile(turnstileToken, remoteIp);
  if (!verified) {
    return res.status(403).json({ error: "CAPTCHA verification failed" });
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

    return res.status(200).json({ url: accountLink.url });
  } catch (err) {
    console.error("connect-onboarding error:", err);
    return res.status(500).json({ error: err.message });
  }
}
