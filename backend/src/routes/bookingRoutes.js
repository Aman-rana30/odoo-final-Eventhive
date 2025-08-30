import express from 'express';
import {
  createOrder,
  verifyPayment,
  getMyBookings,
  getBooking,
  cancelBooking,
  downloadTicket,
  resendTicket,
  getEventBookings,
  exportBookings
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateCreateOrder } from '../middlewares/validation.js';

const router = express.Router();

// Booking flow
router.post('/create-order', authenticate, validateCreateOrder, createOrder);
router.post('/verify-payment', authenticate, verifyPayment);

// User bookings
router.get('/my', authenticate, getMyBookings);
router.get('/:id', authenticate, getBooking);
router.patch('/:id/cancel', authenticate, cancelBooking);
router.get('/:id/download', authenticate, downloadTicket);
router.post('/:id/resend', authenticate, resendTicket);

// Organizer access
router.get('/event/:eventId', authenticate, authorize('EventManager', 'Admin'), getEventBookings);
router.get('/event/:eventId/export', authenticate, authorize('EventManager', 'Admin'), exportBookings);

export default router;