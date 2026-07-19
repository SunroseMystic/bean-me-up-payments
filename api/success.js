export default function handler(req, res) {
  res.status(200).send(`
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Thank you</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
    }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #fff3e6, #ffe0c2);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      color: #4a2f1c;
      text-align: center;
    }
    .card {
      background: #ffffff;
      border-radius: 20px;
      padding: 48px 40px;
      max-width: 420px;
      width: 90%;
      margin: 24px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(120, 72, 30, 0.18);
    }
    .emoji {
      font-size: 3rem;
      margin-bottom: 8px;
    }
    h1 {
      margin: 0 0 12px;
      font-size: 2.2rem;
      color: #7a3e12;
    }
    p {
      margin: 0 0 28px;
      font-size: 1.05rem;
      color: #6b4a30;
    }
    a.button {
      display: inline-block;
      padding: 14px 26px;
      border-radius: 12px;
      background: #b5651d;
      color: #fff8f0;
      font-weight: 700;
      text-decoration: none;
      transition: transform 0.05s ease, box-shadow 0.05s ease;
      box-shadow: 0 8px 20px rgba(181, 101, 29, 0.35);
    }
    a.button:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 26px rgba(181, 101, 29, 0.45);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">🍫</div>
    <h1>Thank you!</h1>
    <p>Your support means a lot. The donation went through successfully.</p>
    <a class="button" href="https://buymechocolate.co">Return to Buy Me Chocolate</a>
  </div>
</body>
</html>
  `);
}
