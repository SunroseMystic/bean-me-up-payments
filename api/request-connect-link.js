import { Resend } from "resend";
import crypto from "crypto";
import { checkBotId } from "botid/server";
import disposableDomains from "disposable-email-domains" assert { type: "json" };

const resend = new Resend(process.env.RESEND_API_KEY);
const LINK_SECRET = process.env.CONNECT_LINK_SECRET;
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
const LINK_TTL_MS = 30 * 60 * 1000; // 30 minutes

const disposableSet = new Set(disposableDomains);

function signToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", LINK_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

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

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isDisposableEmail(email) {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  return domain ? disposableSet.has(domain) : true;
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
  const { email, turnstileToken } = req.body || {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }
  if (isDisposableEmail(email)) {
    return res.status(403).json({ error: "Please use a permanent email address, not a temporary/disposable one." });
  }
  const remoteIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim();
  const verified = await verifyTurnstile(turnstileToken, remoteIp);
  if (!verified) {
    return res.status(403).json({ error: "CAPTCHA verification failed" });
  }
  const token = signToken({ email, exp: Date.now() + LINK_TTL_MS });
  const link = `https://fuel.buymechocolate.co/connect?token=${token}`;
  try {
    await resend.emails.send({
      from: "support@buymechocolate.co",
      to: email,
      subject: "Your Buy Me Chocolate setup link 🍫🔗",
      html: `
        <h2>Almost there!</h2>
        <p>Here's your personal link to connect your Stripe account and start receiving chocolate:</p>
        <p><a href="${link}">Connect your Stripe account →</a></p>
        <p>This link works once and expires in 30 minutes, so don't let it sit too long.</p>
        <p>Didn't request this? No worries, just ignore this email — nothing happens unless you click.</p>
        <p>— Buy Me Chocolate</p>
      `,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("request-connect-link error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
