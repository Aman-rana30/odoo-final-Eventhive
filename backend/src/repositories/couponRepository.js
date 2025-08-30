import Coupon from '../models/Coupon.js';

class CouponRepository {
  async create(couponData) {
    const coupon = new Coupon(couponData);
    return await coupon.save();
  }

  async findById(id) {
    return await Coupon.findById(id).populate('createdBy', 'name email');
  }

  async findByCode(code) {
    return await Coupon.findOne({ code: code.toUpperCase(), active: true });
  }

  async findByCreator(createdBy, { page, limit, active, eventId }) {
    const filters = { createdBy };
    if (typeof active === 'boolean') {
      filters.active = active;
    }
    if (eventId) {
      filters.$or = [
        { applicableEventIds: { $in: [eventId] } },
        { applicableEventIds: { $size: 0 } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [coupons, total] = await Promise.all([
      Coupon.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Coupon.countDocuments(filters)
    ]);

    return { coupons, total };
  }

  async update(id, updateData) {
    return await Coupon.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
  }

  async incrementUsage(id) {
    return await Coupon.findByIdAndUpdate(
      id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
  }

  async delete(id) {
    return await Coupon.findByIdAndUpdate(id, { active: false });
  }
}

export default new CouponRepository();