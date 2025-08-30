import userRepository from '../repositories/userRepository.js';
import eventRepository from '../repositories/eventRepository.js';
import bookingRepository from '../repositories/bookingRepository.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';

class AdminService {
  async getDashboardStats() {
    const [
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue,
      recentBookings
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Event.countDocuments({ status: 'Published' }),
      Booking.countDocuments({ status: 'Paid' }),
      Booking.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Booking.find({ status: 'Paid' })
        .populate('eventId', 'title')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    return {
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentBookings
    };
  }

  async getUsers({ page, limit, role, search }) {
    const filters = { isActive: true };
    
    if (role) {
      filters.roles = { $in: [role] };
    }
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    return await userRepository.findWithFilters({
      filters,
      page,
      limit,
      sort: { createdAt: -1 }
    });
  }

  async updateUserRole(userId, roles) {
    return await userRepository.update(userId, { roles });
  }
}

export default new AdminService();