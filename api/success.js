export default function handler(req, res) {
  res.status(200).send(`
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Thank you</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1f2933, #111827);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      color: #f9fafb;
    }
    .card {
      background: #0f172a;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 420px;
      width: 90%;
      text-align: center;
      box-shadow: 0 25px 60px rgba(0,0,0,0.45);
    }
    h1 {
      margin: 0 0 12px;
      font-size: 2.2rem;
    }
    p {
      margin: 0 0 28px;
      font-size: 1.05rem;
      color: #cbd5e1;
    }
    a.button {
      display: inline-block;
      padding: 14px 22px;
      border-radius: 10px;
      background: #22c55e;
      color: #052e16;
      font-weight: 700;
      text-decoration: none;
      transition: transform 0.05s ease, box-shadow 0.05s ease;
      box-shadow: 0 8px 20px rgba(34,197,94,0.35);
    }
    a.button:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 26px rgba(34,197,94,0.45);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Thank you!</h1>
    <p>Your support means a lot. The donation went through successfully.</p>
    <a class="button" href="https://buymechocolate.co">Return to Buy Me Chocolate</a>
  </div>
</body>
</html>
  `);
}

