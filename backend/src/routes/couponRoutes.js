import express from 'express';
import {
  createCoupon,
  validateCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon
} from '../controllers/couponController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateCoupon as validateCouponSchema } from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.post('/validate/:code', validateCoupon);

// Protected routes
router.post('/', authenticate, authorize('EventManager', 'Admin'), validateCouponSchema, createCoupon);
router.get('/', authenticate, authorize('EventManager', 'Admin'), getCoupons);
router.put('/:id', authenticate, authorize('EventManager', 'Admin'), updateCoupon);
router.delete('/:id', authenticate, authorize('EventManager', 'Admin'), deleteCoupon);

export default router;