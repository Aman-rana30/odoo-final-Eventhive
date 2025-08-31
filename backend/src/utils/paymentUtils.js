import crypto from 'crypto';
import { config } from '../config/env.js';

export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  // For dummy payments, always return true
  if (orderId.startsWith('dummy_') || signature === 'dummy_signature') {
    console.log('🔄 Dummy payment signature verification - always valid');
    return true;
  }

  // For real payments, verify with Razorpay
  if (!config.RAZORPAY_KEY_SECRET) {
    console.log('⚠️ Razorpay not configured, skipping signature verification');
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

export const verifyWebhookSignature = (payload, signature) => {
  const generatedSignature = crypto
    .createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return generatedSignature === signature;
};