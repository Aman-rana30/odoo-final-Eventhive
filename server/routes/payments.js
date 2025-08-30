const express = require('express');
const {
  createOrder,
  verifyPayment,
  getUserOrders,
  getOrder,
  processRefund,
  applyCoupon
} = require('../controllers/paymentsController');
const { protect } = require('../middleware/auth');
const {
  validateOrder,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Order and payment routes
router.post('/create-order', validateOrder, handleValidationErrors, createOrder);
router.post('/verify', verifyPayment);
router.get('/orders', getUserOrders);
router.get('/orders/:orderId', getOrder);
router.post('/refund/:orderId', processRefund);

// Coupon routes
router.post('/apply-coupon', applyCoupon);

module.exports = router;
