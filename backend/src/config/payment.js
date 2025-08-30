import Razorpay from 'razorpay';
import Stripe from 'stripe';
import { config } from './env.js';

// Razorpay instance
export const razorpay = config.RAZORPAY_KEY_ID ? new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET
}) : null;

// Stripe instance
export const stripe = config.STRIPE_SECRET_KEY ? new Stripe(config.STRIPE_SECRET_KEY) : null;

export const getPaymentGateway = () => {
  return config.PAYMENT_GATEWAY || 'razorpay';
};

export const createPaymentOrder = async (amount, currency = 'INR', notes = {}) => {
  const gateway = getPaymentGateway();
  
  if (gateway === 'razorpay' && razorpay) {
    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      notes
    };
    return await razorpay.orders.create(options);
  } else if (gateway === 'stripe' && stripe) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: currency.toLowerCase(),
      metadata: notes
    });
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    };
  }
  
  throw new Error('Payment gateway not configured');
};
```