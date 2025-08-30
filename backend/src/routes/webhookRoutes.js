import express from 'express';
import { verifyWebhookSignature } from '../utils/paymentUtils.js';
import bookingRepository from '../repositories/bookingRepository.js';

const router = express.Router();

// Razorpay webhook
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const payload = req.body;

    if (!verifyWebhookSignature(payload, signature)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(payload.toString());
    
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      
      // Update booking status
      const booking = await bookingRepository.findByBookingId(payment.notes.bookingId);
      if (booking) {
        await bookingRepository.updatePaymentStatus(booking.bookingId, {
          gateway: 'razorpay',
          orderId: payment.order_id,
          paymentId: payment.id,
          status: 'completed'
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

export default router;