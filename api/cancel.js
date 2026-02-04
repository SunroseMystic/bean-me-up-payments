export default function handler(req, res) {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Payment Canceled</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            background: #fafafa;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 420px;
          }
          h1 {
            margin-top: 0;
          }
          a {
            display: inline-block;
            margin-top: 20px;
            text-decoration: none;
            color: white;
            background: #635bff;
            padding: 12px 20px;
            border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Payment canceled</h1>
          <p>No charges were made.</p>
          <a href="/">Go back</a>
        </div>
      </body>
    </html>
  `);
}
