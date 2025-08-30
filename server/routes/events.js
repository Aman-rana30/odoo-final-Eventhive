const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImages,
  getOrganizerEvents,
  getEventAnalytics
} = require('../controllers/eventsController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateEvent,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEvent);

// Protected routes - Organizers only
router.use(protect);
router.post('/', authorize('organizer', 'admin'), validateEvent, handleValidationErrors, createEvent);
router.put('/:id', authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', authorize('organizer', 'admin'), deleteEvent);
router.post('/:id/upload', authorize('organizer', 'admin'), uploadEventImages);

// Organizer specific routes
router.get('/organizer/my-events', authorize('organizer', 'admin'), getOrganizerEvents);
router.get('/:id/analytics', authorize('organizer', 'admin'), getEventAnalytics);

module.exports = router;
