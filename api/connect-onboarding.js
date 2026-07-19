import Stripe from "stripe";
import crypto from "crypto";
import { checkBotId } from "botid/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
const LINK_SECRET = process.env.CONNECT_LINK_SECRET;

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

function verifyLinkToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;

  const [data, sig] = token.split(".");
  const expectedSig = crypto.createHmac("sha256", LINK_SECRET).update(data).digest("base64url");

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(data, "base64url").toString());
  } catch {
    return null;
  }

  if (!payload.exp || Date.now() > payload.exp) return null;

  return payload;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const botIdResult = await checkBotId({
    advancedOptions: { headers: req.headers },
  });

  if (botIdResult.isBot) {
    return res.status(403).json({ error: "Bot detected" });
  }

  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  const botSignals = ["bot", "crawl", "spider", "slurp", "facebookexternalhit", "slackbot", "whatsapp", "preview", "headless"];
  if (botSignals.some((signal) => userAgent.includes(signal))) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { turnstileToken, linkToken } = req.body || {};

  const linkPayload = verifyLinkToken(linkToken);
  if (!linkPayload) {
    return res.status(403).json({ error: "This link is invalid or has expired. Please request a new one." });
  }

  const remoteIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim();
  const verified = await verifyTurnstile(turnstileToken, remoteIp);
  if (!verified) {
    return res.status(403).json({ error: "CAPTCHA verification failed" });
  }

  try {
    const account = await stripe.accounts.create({
      type: "express",
      email: linkPayload.email,
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
