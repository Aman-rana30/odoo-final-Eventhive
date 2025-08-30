import bookingRepository from '../repositories/bookingRepository.js';
import eventRepository from '../repositories/eventRepository.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

class ReportService {
  async getSalesReport(eventId, userId, { startDate, endDate }) {
    // Verify user owns the event
    const event = await eventRepository.findById(eventId);
    if (!event || event.organizer._id.toString() !== userId) {
      throw new Error('Unauthorized access to event reports');
    }

    const matchStage = {
      eventId: new mongoose.Types.ObjectId(eventId),
      status: 'Paid'
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = startDate;
      if (endDate) matchStage.createdAt.$lte = endDate;
    }

    const [dailySales, ticketSales, totalStats] = await Promise.all([
      // Daily sales breakdown
      Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            revenue: { $sum: '$total' },
            bookings: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]),

      // Ticket type sales
      Booking.aggregate([
        { $match: matchStage },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'tickettypes',
            localField: 'items.ticketTypeId',
            foreignField: '_id',
            as: 'ticketType'
          }
        },
        { $unwind: '$ticketType' },
        {
          $group: {
            _id: '$ticketType.name',
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.priceAtPurchase'] } }
          }
        }
      ]),

      // Total statistics
      bookingRepository.getEventStats(eventId)
    ]);

    return {
      event,
      dailySales,
      ticketSales,
      totalStats
    };
  }

  async getAttendeeReport(eventId, userId) {
    // Verify user owns the event
    const event = await eventRepository.findById(eventId);
    if (!event || event.organizer._id.toString() !== userId) {
      throw new Error('Unauthorized access to event reports');
    }

    const attendees = await Booking.aggregate([
      {
        $match: {
          eventId: new mongoose.Types.ObjectId(eventId),
          status: 'Paid'
        }
      },
      {
        $group: {
          _id: '$attendeeInfo.email',
          name: { $first: '$attendeeInfo.name' },
          phone: { $first: '$attendeeInfo.phone' },
          totalTickets: { $sum: { $sum: '$items.quantity' } },
          totalSpent: { $sum: '$total' },
          checkedIn: { $first: '$checkedIn' },
          bookingDate: { $first: '$createdAt' }
        }
      },
      { $sort: { bookingDate: -1 } }
    ]);

    return { event, attendees };
  }

  async exportEventData(eventId, userId, format) {
    const report = await this.getAttendeeReport(eventId, userId);
    
    // Implementation for actual CSV/Excel export would go here
    // For now, return a placeholder path
    return `/uploads/exports/attendees-${eventId}-${Date.now()}.${format}`;
  }
}

export default new ReportService();