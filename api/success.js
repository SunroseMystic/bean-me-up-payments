export default function handler(req, res) {
  res.status(200).send(`
    <!doctype html>
    <html>
      <head>
        <title>Thank you!</title>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            text-align: center;
            padding: 60px;
            background: #fafafa;
          }
          h1 {
            font-size: 2.2rem;
          }
          p {
            font-size: 1.1rem;
          }
          a {
            display: inline-block;
            margin-top: 20px;
            color: #635bff;
            text-decoration: none;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <h1>￼ Thank you for your support!</h1>
        <p>Your payment was successful.</p>
        <a href="https://buymechocolate.co">Return to Buy Me Chocolate</a>
      </body>
    </html>
  `);
}

