const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUser,
  getEvents,
  updateEvent,
  getOrders,
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  getPlatformAnalytics,
  exportData
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and admin only
router.use(protect, authorize('admin'));

// Dashboard routes
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getPlatformAnalytics);
router.get('/export/:type', exportData);

// User management routes
router.get('/users', getUsers);
router.put('/users/:userId', updateUser);

// Event management routes
router.get('/events', getEvents);
router.put('/events/:eventId', updateEvent);

// Order management routes
router.get('/orders', getOrders);

// Coupon management routes
router.route('/coupons')
  .get(getCoupons)
  .post(createCoupon);

router.route('/coupons/:couponId')
  .put(updateCoupon)
  .delete(deleteCoupon);

module.exports = router;
