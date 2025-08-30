const express = require('express');
const {
  getUserTickets,
  getTicket,
  verifyTicket,
  checkInTicket,
  generateTicketPDF,
  transferTicket,
  getCheckInStats
} = require('../controllers/ticketsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// User ticket routes
router.get('/', getUserTickets);
router.get('/:ticketId', getTicket);
router.get('/:ticketId/pdf', generateTicketPDF);
router.post('/:ticketId/transfer', transferTicket);

// Verification and check-in routes
router.post('/verify', verifyTicket);
router.post('/checkin', authorize('organizer', 'admin'), checkInTicket);

// Analytics routes for organizers
router.get('/event/:eventId/checkin-stats', authorize('organizer', 'admin'), getCheckInStats);

module.exports = router;
