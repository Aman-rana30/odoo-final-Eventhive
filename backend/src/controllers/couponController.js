import couponService from '../services/couponService.js';
import { validationResult } from 'express-validator';

export const createCoupon = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const couponData = { ...req.body, createdBy: req.user.id };
    const coupon = await couponService.createCoupon(couponData);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { eventId, subtotal, userId } = req.body;
    
    const validation = await couponService.validateCoupon(code, {
      eventId,
      subtotal,
      userId: userId || req.user.id
    });

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, active, eventId } = req.query;
    
    const result = await couponService.getCoupons(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      active: active === 'true',
      eventId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await couponService.updateCoupon(id, req.body, req.user.id);

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    await couponService.deleteCoupon(id, req.user.id);

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};