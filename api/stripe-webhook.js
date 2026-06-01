const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    if (event.type === 'account.updated') {
      const account = event.data.object;
      
      if (account.charges_enabled && account.details_submitted) {
        const accountId = account.id;
        
        await resend.emails.send({
          from: ''GoodDay@buymechocolate.co' ,
          to: 'vfosshop@gmail.com',
          subject: 'New Creator Signed Up!',
          html: `<p>A new creator completed onboarding.</p><p><strong>Account ID:</strong> ${accountId}</p>`
        });
      }
    }
    
    res.json({ received: true });
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
