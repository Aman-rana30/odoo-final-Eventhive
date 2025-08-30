import crypto from 'crypto';
import { config } from '../config/env.js';

export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
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