import User from '../models/User.js';

class UserRepository {
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findByPhone(phone) {
    return await User.findOne({ phone });
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
  }

  async updateRefreshToken(id, refreshToken) {
    return await User.findByIdAndUpdate(id, { refreshToken });
  }

  async clearRefreshToken(id) {
    return await User.findByIdAndUpdate(id, { refreshToken: null });
  }

  async findWithFilters({ filters, page, limit, sort }) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-passwordHash -refreshToken'),
      User.countDocuments(filters)
    ]);

    return { users, total };
  }

  async updateLoyaltyPoints(id, points) {
    return await User.findByIdAndUpdate(
      id,
      { $inc: { loyaltyPoints: points } },
      { new: true }
    );
  }
}

export default new UserRepository();