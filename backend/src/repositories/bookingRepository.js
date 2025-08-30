import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

class BookingRepository {
  async create(bookingData) {
    const booking = new Booking(bookingData);
    return await booking.save();
  }

  async findById(id) {
    return await Booking.findById(id)
      .populate('userId', 'name email phone')
      .populate('eventId', 'title startAt venue organizer')
      .populate('items.ticketTypeId', 'name price');
  }

  async findByBookingId(bookingId) {
    return await Booking.findOne({ bookingId })
      .populate('userId', 'name email phone')
      .populate('eventId', 'title startAt venue organizer')
      .populate('items.ticketTypeId', 'name price');
  }

  async findByUserId(userId, { page, limit, status }) {
    const filters = { userId };
    if (status) {
      filters.status = status;
    }

    const skip = (page - 1) * limit;
    
    const [bookings, total] = await Promise.all([
      Booking.find(filters)
        .populate('eventId', 'title startAt venue coverImageUrl')
        .populate('items.ticketTypeId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filters)
    ]);

    return { bookings, total };
  }

  async findByEventId(eventId, { page, limit, search, status }) {
    const filters = { eventId };
    if (status) {
      filters.status = status;
    }

    if (search) {
      filters.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { 'attendeeInfo.name': { $regex: search, $options: 'i' } },
        { 'attendeeInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [bookings, total] = await Promise.all([
      Booking.find(filters)
        .populate('userId', 'name email')
        .populate('items.ticketTypeId', 'name price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filters)
    ]);

    return { bookings, total };
  }

  async update(id, updateData) {
    return await Booking.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
  }

  async updatePaymentStatus(bookingId, paymentData) {
    return await Booking.findOneAndUpdate(
      { bookingId },
      { 
        payment: paymentData,
        status: paymentData.status === 'completed' ? 'Paid' : 'Pending'
      },
      { new: true }
    );
  }

  async markCheckedIn(bookingId, checkedInBy) {
    return await Booking.findOneAndUpdate(
      { bookingId, checkedIn: false },
      { 
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy
      },
      { new: true }
    );
  }

  async getEventStats(eventId) {
    const stats = await Booking.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          paidBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] }
          },
          checkedInCount: {
            $sum: { $cond: ['$checkedIn', 1, 0] }
          }
        }
      }
    ]);

    return stats[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      paidBookings: 0,
      checkedInCount: 0
    };
  }

  async generateBookingId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `EH${timestamp}${random}`;
  }
}

export default new BookingRepository();