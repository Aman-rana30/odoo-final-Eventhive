import express from 'express';
import {
  getEvents,
  getEvent,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  getFeaturedEvents,
  getTrendingEvents,
  trackEventView,
  getMyEvents
} from '../controllers/eventController.js';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.js';
import { validateEvent } from '../middlewares/validation.js';
import { uploadSingle } from '../middlewares/upload.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/trending', getTrendingEvents);
router.get('/slug/:slug', optionalAuth, getEventBySlug);
router.get('/:id', optionalAuth, getEvent);
router.post('/:id/track-view', optionalAuth, trackEventView);

// Protected routes
router.get('/my/events', authenticate, authorize('EventManager', 'Admin'), getMyEvents);
router.post('/', authenticate, authorize('EventManager', 'Admin'), uploadSingle('coverImage'), validateEvent, createEvent);
router.put('/:id', authenticate, authorize('EventManager', 'Admin'), uploadSingle('coverImage'), updateEvent);
router.patch('/:id/publish', authenticate, authorize('EventManager', 'Admin'), publishEvent);
router.delete('/:id', authenticate, authorize('EventManager', 'Admin'), deleteEvent);

export default router;