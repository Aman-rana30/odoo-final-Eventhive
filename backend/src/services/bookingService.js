import mongoose from 'mongoose';
import bookingRepository from '../repositories/bookingRepository.js';
import eventRepository from '../repositories/eventRepository.js';
import ticketRepository from '../repositories/ticketRepository.js';
import couponRepository from '../repositories/couponRepository.js';
import userRepository from '../repositories/userRepository.js';
import { createPaymentOrder, getPaymentGateway } from '../config/payment.js';
import { generateTicketPDF } from '../utils/pdfGenerator.js';
import { sendEmail, generateTicketEmailHTML } from '../config/email.js';
import { sendWhatsAppMessage, generateTicketWhatsAppMessage } from '../config/whatsapp.js';
import { verifyPaymentSignature } from '../utils/paymentUtils.js';

class BookingService {
  async createPaymentOrder({ userId, eventId, items, attendeeInfo, couponCode }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log('🚀 Starting createPaymentOrder...');
      
      // Validate event
      const event = await eventRepository.findById(eventId);
      if (!event || event.status !== 'Published') {
        throw new Error('Event not found or not available for booking');
      }
      console.log('✅ Event validated:', event.title);

      // Validate and reserve tickets
      let subtotal = 0;
      const reservedItems = [];

      for (const item of items) {
        const availability = await ticketRepository.checkAvailability(
          item.ticketTypeId, 
          item.quantity, 
          userId
        );

        if (!availability.available) {
          throw new Error(`Ticket not available: ${availability.reason}`);
        }

        // Reserve tickets (decrement quantity)
        await ticketRepository.decrementQuantity(item.ticketTypeId, item.quantity);
        
        const itemTotal = availability.ticket.price * item.quantity;
        subtotal += itemTotal;

        reservedItems.push({
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
          priceAtPurchase: availability.ticket.price
        });
      }
      console.log('✅ Tickets reserved, subtotal:', subtotal);

      // Apply coupon if provided
      let discount = 0;
      if (couponCode) {
        const couponValidation = await couponRepository.findByCode(couponCode);
        if (couponValidation) {
          discount = this.calculateDiscount(couponValidation, subtotal);
        }
      }

      const total = subtotal - discount;
      console.log('💰 Total amount:', total);

      // Generate booking ID
      const bookingId = await bookingRepository.generateBookingId();
      console.log('🆔 Generated booking ID:', bookingId);

      // Create payment order
      console.log('💳 Creating payment order...');
      const paymentOrder = await createPaymentOrder(total, 'INR', {
        bookingId,
        eventId: event._id.toString(),
        userId
      });
      console.log('✅ Payment order created:', paymentOrder.id);

      // Create pending booking
      const bookingData = {
        bookingId,
        userId,
        eventId,
        items: reservedItems,
        attendeeInfo,
        subtotal,
        discount,
        total,
        couponCode,
        payment: {
          gateway: getPaymentGateway(),
          orderId: paymentOrder.id,
          status: 'pending'
        }
      };

      console.log('📦 Creating booking with data:', bookingData);
      const booking = await bookingRepository.create(bookingData);
      console.log('✅ Booking created:', booking._id);

      await session.commitTransaction();
      console.log('✅ Transaction committed successfully');

      return {
        booking,
        paymentOrder: {
          id: paymentOrder.id,
          amount: total,
          currency: 'INR'
        }
      };
    } catch (error) {
      console.error('❌ Error in createPaymentOrder:', error);
      console.error('❌ Error stack:', error.stack);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async verifyAndCompletePayment({ orderId, paymentId, signature, bookingData, userId }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Verify payment signature
      const isValidSignature = verifyPaymentSignature({
        orderId,
        paymentId,
        signature
      });

      if (!isValidSignature) {
        throw new Error('Invalid payment signature');
      }

      // Update booking with payment details
      const booking = await bookingRepository.findByBookingId(bookingData.bookingId);
      if (!booking || booking.userId.toString() !== userId) {
        throw new Error('Booking not found or unauthorized');
      }

      // Update payment status
      const updatedBooking = await bookingRepository.updatePaymentStatus(booking.bookingId, {
        gateway: 'razorpay',
        orderId,
        paymentId,
        signature,
        status: 'completed'
      });

      // Update event revenue
      await eventRepository.updateRevenue(booking.eventId, booking.total);

      // Award loyalty points (1 point per ₹10 spent)
      const loyaltyPoints = Math.floor(booking.total / 10);
      await userRepository.updateLoyaltyPoints(userId, loyaltyPoints);

      // Generate and deliver ticket
      await this.generateAndDeliverTicket(updatedBooking);

      await session.commitTransaction();

      return updatedBooking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async generateAndDeliverTicket(booking) {
    try {
      console.log('🎫 Starting generateAndDeliverTicket...');
      console.log('📋 Booking data:', {
        id: booking._id,
        bookingId: booking.bookingId,
        eventId: booking.eventId
      });
      
      // Generate PDF ticket
      console.log('📄 Generating PDF ticket...');
      const event = await eventRepository.findById(booking.eventId);
      console.log('📅 Event found:', event ? event.title : 'No event');
      
      const pdfPath = await generateTicketPDF(booking, event);
      console.log('📄 PDF generated at:', pdfPath);
      
      // Update booking with PDF path
      console.log('💾 Updating booking with PDF path...');
      await bookingRepository.update(booking._id, { pdfUrl: pdfPath });

      // Send email
      console.log('📧 Sending email...');
      const emailHTML = generateTicketEmailHTML(booking, event);
      const emailResult = await sendEmail(
        booking.attendeeInfo.email,
        `Your EventHive Ticket - ${event.title}`,
        emailHTML,
        [{ filename: `ticket-${booking.bookingId}.pdf`, path: pdfPath }]
      );
      console.log('📧 Email result:', emailResult);

      // Send WhatsApp
      console.log('📱 Sending WhatsApp...');
      const whatsappMessage = generateTicketWhatsAppMessage(booking, event);
      const whatsappResult = await sendWhatsAppMessage(
        booking.attendeeInfo.phone,
        whatsappMessage
      );
      console.log('📱 WhatsApp result:', whatsappResult);

      // Update delivery status
      console.log('📊 Updating delivery status...');
      await bookingRepository.update(booking._id, {
        'delivery.emailed': emailResult.success,
        'delivery.whatsapped': whatsappResult.success,
        'delivery.emailedAt': emailResult.success ? new Date() : undefined,
        'delivery.whatsappedAt': whatsappResult.success ? new Date() : undefined
      });

      console.log('✅ generateAndDeliverTicket completed successfully');
    } catch (error) {
      console.error('❌ Ticket delivery error:', error);
      console.error('❌ Error stack:', error.stack);
      // Don't throw error here as payment is already completed
    }
  }

  async getUserBookings(userId, options) {
    return await bookingRepository.findByUserId(userId, options);
  }

  async getBookingById(bookingId, userId) {
    const booking = await bookingRepository.findByBookingId(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId._id.toString() !== userId) {
      throw new Error('Unauthorized access to booking');
    }

    return booking;
  }

  async getEventBookings(eventId, organizerId, options) {
    // Verify organizer owns the event
    const event = await eventRepository.findById(eventId);
    if (!event || event.organizer._id.toString() !== organizerId) {
      throw new Error('Unauthorized access to event bookings');
    }

    return await bookingRepository.findByEventId(eventId, options);
  }

  async cancelBooking(bookingId, userId, reason) {
    const booking = await this.getBookingById(bookingId, userId);
    
    if (booking.status !== 'Paid') {
      throw new Error('Only paid bookings can be cancelled');
    }

    const event = await eventRepository.findById(booking.eventId);
    const refundAmount = this.calculateRefundAmount(booking.total, event.startAt);

    if (refundAmount <= 0) {
      throw new Error('Refund not allowed for this booking');
    }

    // Process refund through payment gateway
    // Implementation depends on gateway
    
    // Update booking status
    const updatedBooking = await bookingRepository.update(booking._id, {
      status: 'Refunded',
      refund: {
        amount: refundAmount,
        reason,
        refundedAt: new Date()
      }
    });

    // Restore ticket quantities
    for (const item of booking.items) {
      await ticketRepository.incrementQuantity(item.ticketTypeId, item.quantity);
    }

    return updatedBooking;
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

  calculateRefundAmount(total, eventStartAt) {
    const now = new Date();
    const hoursUntilEvent = (eventStartAt - now) / (1000 * 60 * 60);

    if (hoursUntilEvent >= 48) {
      return total; // Full refund
    } else if (hoursUntilEvent >= 24) {
      return total * 0.5; // 50% refund
    } else {
      return 0; // No refund
    }
  }

  async resendTicket(bookingId, userId, method) {
    const booking = await this.getBookingById(bookingId, userId);
    const event = await eventRepository.findById(booking.eventId);

    if (method === 'email') {
      const emailHTML = generateTicketEmailHTML(booking, event);
      await sendEmail(
        booking.attendeeInfo.email,
        `Your EventHive Ticket - ${event.title}`,
        emailHTML,
        [{ filename: `ticket-${booking.bookingId}.pdf`, path: booking.pdfUrl }]
      );
    } else if (method === 'whatsapp') {
      const message = generateTicketWhatsAppMessage(booking, event);
      await sendWhatsAppMessage(booking.attendeeInfo.phone, message);
    }
  }

  async exportBookings(eventId, organizerId, format = 'csv') {
    const event = await eventRepository.findById(eventId);
    if (!event || event.organizer._id.toString() !== organizerId) {
      throw new Error('Unauthorized access to event bookings');
    }

    const bookings = await bookingRepository.findByEventId(eventId, {
      page: 1,
      limit: 10000
    });

    // Implementation for CSV/Excel export would go here
    return `/uploads/exports/bookings-${eventId}-${Date.now()}.${format}`;
  }

  async completeDummyPayment(bookingId, paymentDetails) {
    try {
      console.log('🚀 Starting completeDummyPayment...');
      console.log('🔍 Looking for booking with ID:', bookingId);
      
      // Find the booking by ID
      const booking = await bookingRepository.findByBookingId(bookingId);
      console.log('👤 Booking found:', booking ? 'Yes' : 'No');
      
      if (!booking) {
        console.log('❌ Booking not found for ID:', bookingId);
        throw new Error('Booking not found');
      }

      console.log('✅ Booking found, updating payment status...');

      // Update payment status
      const updatedBooking = await bookingRepository.updatePaymentStatus(bookingId, {
        gateway: getPaymentGateway(),
        orderId: `dummy_${Date.now()}`,
        paymentId: paymentDetails.paymentId,
        signature: 'dummy_signature',
        status: 'completed'
      });

      console.log('✅ Payment status updated');

      // Update event revenue
      console.log('💰 Updating event revenue...');
      await eventRepository.updateRevenue(booking.eventId, booking.total);

      // Award loyalty points (1 point per ₹10 spent)
      console.log('🎯 Awarding loyalty points...');
      const loyaltyPoints = Math.floor(booking.total / 10);
      await userRepository.updateLoyaltyPoints(booking.userId, loyaltyPoints);

      // Generate and deliver ticket
      console.log('🎫 Generating and delivering ticket...');
      await this.generateAndDeliverTicket(updatedBooking);

      console.log('✅ completeDummyPayment completed successfully');
      return updatedBooking;
    } catch (error) {
      console.error('❌ Dummy payment completion error:', error);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  }
}

export default new BookingService();