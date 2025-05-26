# Stripe Payment Integration Setup

To enable real payments for the Companies House PDF Downloader, you need to set up a server endpoint to handle Stripe payments securely.

## Quick Setup

1. **Get your Stripe keys**
   - Sign up at https://stripe.com
   - Get your publishable key (starts with `pk_`)
   - Get your secret key (starts with `sk_`)

2. **Update the public key in index.html**
   ```javascript
   const STRIPE_PUBLIC_KEY = 'pk_live_YOUR_PUBLISHABLE_KEY_HERE';
   ```

3. **Create a server endpoint** (example using Node.js/Express)

```javascript
// server.js
const express = require('express');
const stripe = require('stripe')('sk_live_YOUR_SECRET_KEY_HERE');
const app = express();

app.use(express.json());
app.use(express.static('.')); // Serve your HTML files

// Create payment intent endpoint
app.post('/create-payment-intent', async (req, res) => {
  const { companyName, fileCount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 500, // £5.00 in pence
      currency: 'gbp',
      metadata: {
        companyName,
        fileCount
      }
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

4. **Update index.html to use the payment intent**

Replace the payment simulation code with:

```javascript
// Create payment intent
const response = await fetch('/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyName: companyData.title,
    fileCount: allDocuments.length
  })
});

const { clientSecret } = await response.json();

// Confirm payment
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: /* card element */,
    billing_details: {
      name: 'Customer Name'
    }
  }
});

if (!error) {
  paymentCompleted = true;
  // Continue with download
}
```

## Alternative: Stripe Payment Links

For a simpler setup without a server:

1. Create a Payment Link in Stripe Dashboard
2. Set the price to £5
3. Use the payment link URL in your code:

```javascript
window.location.href = 'https://buy.stripe.com/YOUR_PAYMENT_LINK';
```

## Security Notes

- Never expose your secret key in client-side code
- Always validate payments on the server side
- Consider implementing webhooks to verify successful payments
- Store payment records for compliance

## Testing

Use these test card numbers:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Authentication: 4000 0025 0000 3155

For production deployment, ensure:
- HTTPS is enabled
- API keys are stored securely
- Payment confirmations are logged
- Refund policy is clear to users