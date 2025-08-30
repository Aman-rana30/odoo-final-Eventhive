import express from 'express';
import {
  getEventTickets,
  createTicketType,
  updateTicketType,
  deleteTicketType,
  checkAvailability
} from '../controllers/ticketController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateTicketType } from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.get('/event/:eventId', getEventTickets);
router.get('/:ticketTypeId/availability', checkAvailability);

// Protected routes
router.post('/event/:eventId', authenticate, authorize('EventManager', 'Admin'), validateTicketType, createTicketType);
router.put('/:id', authenticate, authorize('EventManager', 'Admin'), updateTicketType);
router.delete('/:id', authenticate, authorize('EventManager', 'Admin'), deleteTicketType);

export default router;