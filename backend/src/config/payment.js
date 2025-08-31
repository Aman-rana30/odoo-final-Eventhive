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
  const gateway = config.PAYMENT_GATEWAY || 'dummy';
  console.log('🔍 getPaymentGateway called, returning:', gateway);
  console.log('🔍 config.PAYMENT_GATEWAY:', config.PAYMENT_GATEWAY);
  return gateway;
};

export const createPaymentOrder = async (amount, currency = 'INR', notes = {}) => {
  const gateway = getPaymentGateway();
  console.log('🔍 Payment gateway selected:', gateway);
  console.log('💰 Amount:', amount, 'Currency:', currency);
  console.log('📝 Notes:', notes);
  
  if (gateway === 'razorpay' && razorpay) {
    console.log('💳 Using Razorpay payment gateway');
    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      notes
    };
    return await razorpay.orders.create(options);
  } else if (gateway === 'stripe' && stripe) {
    console.log('💳 Using Stripe payment gateway');
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
  } else {
    // Dummy payment order for testing
    console.log('🔄 Creating dummy payment order for amount:', amount);
    const dummyOrder = {
      id: `dummy_order_${Date.now()}`,
      amount: amount * 100,
      currency,
      status: 'created',
      notes
    };
    console.log('✅ Dummy order created:', dummyOrder);
    return dummyOrder;
  }
};