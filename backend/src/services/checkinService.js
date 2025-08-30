import bookingRepository from '../repositories/bookingRepository.js';
import eventRepository from '../repositories/eventRepository.js';
import { verifyQRPayload } from '../utils/qrGenerator.js';
import Checkin from '../models/Checkin.js';

class CheckinService {
  async processCheckin({ qrPayload, bookingId, scannedBy, deviceInfo }) {
    try {
      let validatedBookingId = bookingId;

      // If QR payload provided, verify and extract booking ID
      if (qrPayload) {
        const qrVerification = verifyQRPayload(qrPayload);
        if (!qrVerification.valid) {
          throw new Error(qrVerification.error);
        }
        validatedBookingId = qrVerification.bookingId;
      }

      // Find booking
      const booking = await bookingRepository.findByBookingId(validatedBookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'Paid') {
        throw new Error('Invalid booking status for check-in');
      }

      // Check if already checked in
      if (booking.checkedIn) {
        return {
          success: false,
          message: 'Already checked in',
          checkedInAt: booking.checkedInAt,
          booking
        };
      }

      // Mark as checked in
      const updatedBooking = await bookingRepository.markCheckedIn(
        validatedBookingId, 
        scannedBy
      );

      // Log check-in
      await Checkin.create({
        bookingId: validatedBookingId,
        eventId: booking.eventId,
        scannedBy,
        deviceInfo
      });

      return {
        success: true,
        message: 'Check-in successful',
        booking: updatedBooking
      };
    } catch (error) {
      throw error;
    }
  }

  async getEventCheckinStats(eventId, userId) {
    // Verify user has access to this event
    const event = await eventRepository.findById(eventId);
    if (!event || event.organizer._id.toString() !== userId) {
      throw new Error('Unauthorized access to event statistics');
    }

    return await bookingRepository.getEventStats(eventId);
  }

  async getCheckinHistory(eventId, userId, { page, limit }) {
    // Verify user has access to this event
    const event = await eventRepository.findById(eventId);
    if (!event || event.organizer._id.toString() !== userId) {
      throw new Error('Unauthorized access to check-in history');
    }

    const skip = (page - 1) * limit;
    
    const [checkins, total] = await Promise.all([
      Checkin.find({ eventId })
        .populate('scannedBy', 'name email')
        .sort({ scannedAt: -1 })
        .skip(skip)
        .limit(limit),
      Checkin.countDocuments({ eventId })
    ]);

    return { checkins, total };
  }

  async searchBookings(eventId, query, userId) {
    // Verify user has access to this event
    const event = await eventRepository.findById(eventId);
    if (!event || event.organizer._id.toString() !== userId) {
      throw new Error('Unauthorized access to event bookings');
    }

    return await bookingRepository.findByEventId(eventId, {
      page: 1,
      limit: 20,
      search: query
    });
  }
}

export default new CheckinService();