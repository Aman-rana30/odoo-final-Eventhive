import couponRepository from '../repositories/couponRepository.js';

class CouponService {
  async createCoupon(couponData) {
    return await couponRepository.create(couponData);
  }

  async validateCoupon(code, { eventId, subtotal, userId }) {
    const coupon = await couponRepository.findByCode(code);
    
    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    const now = new Date();
    
    // Check validity period
    if (now < coupon.validFrom || now > coupon.validTo) {
      return { valid: false, message: 'Coupon has expired or not yet valid' };
    }

    // Check minimum amount
    if (subtotal < coupon.minAmount) {
      return { 
        valid: false, 
        message: `Minimum order amount is ₹${coupon.minAmount}` 
      };
    }

    // Check global usage limit
    if (coupon.usageLimitGlobal && coupon.usageCount >= coupon.usageLimitGlobal) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    // Check event applicability
    if (coupon.applicableEventIds.length > 0 && 
        !coupon.applicableEventIds.includes(eventId)) {
      return { valid: false, message: 'Coupon not applicable for this event' };
    }

    // Calculate discount
    const discount = this.calculateDiscount(coupon, subtotal);

    return {
      valid: true,
      coupon,
      discount,
      finalAmount: subtotal - discount
    };
  }

  async getCoupons(userId, options) {
    return await couponRepository.findByCreator(userId, options);
  }

  async updateCoupon(couponId, updateData, userId) {
    const coupon = await couponRepository.findById(couponId);
    if (!coupon || coupon.createdBy.toString() !== userId) {
      throw new Error('Coupon not found or unauthorized');
    }

    return await couponRepository.update(couponId, updateData);
  }

  async deleteCoupon(couponId, userId) {
    const coupon = await couponRepository.findById(couponId);
    if (!coupon || coupon.createdBy.toString() !== userId) {
      throw new Error('Coupon not found or unauthorized');
    }

    return await couponRepository.delete(couponId);
  }

  calculateDiscount(coupon, subtotal) {
    if (subtotal < coupon.minAmount) {
      return 0;
    }

    let discount = 0;
    
    if (coupon.type === 'PERCENT') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === 'FIXED') {
      discount = coupon.value;
    }

    return Math.min(discount, subtotal);
  }
}

export default new CouponService();