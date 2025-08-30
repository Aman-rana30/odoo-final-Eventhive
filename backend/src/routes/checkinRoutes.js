import express from 'express';
import {
  scanQR,
  getEventCheckinStats,
  getCheckinHistory,
  searchBooking
} from '../controllers/checkinController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Check-in operations
router.post('/scan', authenticate, authorize('Volunteer', 'EventManager', 'Admin'), scanQR);
router.get('/event/:eventId/stats', authenticate, authorize('EventManager', 'Admin'), getEventCheckinStats);
router.get('/event/:eventId/history', authenticate, authorize('EventManager', 'Admin'), getCheckinHistory);
router.get('/event/:eventId/search', authenticate, authorize('Volunteer', 'EventManager', 'Admin'), searchBooking);

export default router;