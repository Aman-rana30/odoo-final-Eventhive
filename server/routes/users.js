const express = require('express');
const {
  getUserProfile,
  updateProfile,
  getDashboard,
  getEventHistory,
  getUserTickets,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  createReview,
  getUserReviews
} = require('../controllers/usersController');
const { protect } = require('../middleware/auth');
const {
  validateReview,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.route('/profile')
  .get(getUserProfile)
  .put(updateProfile);

// Dashboard and history routes
router.get('/dashboard', getDashboard);
router.get('/history', getEventHistory);
router.get('/tickets', getUserTickets);

// Favorites routes
router.route('/favorites')
  .get(getFavorites);

router.route('/favorites/:eventId')
  .post(addToFavorites)
  .delete(removeFromFavorites);

// Review routes
router.get('/reviews', getUserReviews);
router.post('/reviews/:eventId', validateReview, handleValidationErrors, createReview);

module.exports = router;
