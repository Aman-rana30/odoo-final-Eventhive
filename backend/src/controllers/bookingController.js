import bookingService from '../services/bookingService.js';
import { validationResult } from 'express-validator';

export const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { eventId, items, attendeeInfo, couponCode } = req.body;
    const order = await bookingService.createPaymentOrder({
      userId: req.user.id,
      eventId,
      items,
      attendeeInfo,
      couponCode
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, bookingData } = req.body;
    
    const booking = await bookingService.verifyAndCompletePayment({
      orderId,
      paymentId,
      signature,
      bookingData,
      userId: req.user.id
    });

    res.json({
      success: true,
      message: 'Payment verified and booking completed',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const result = await bookingService.getUserBookings(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id, req.user.id);

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const result = await bookingService.cancelBooking(id, req.user.id, reason);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const downloadTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pdfPath = await bookingService.getTicketPDF(id, req.user.id);

    res.download(pdfPath, `ticket-${id}.pdf`);
  } catch (error) {
    next(error);
  }
};

export const resendTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { method } = req.body; // 'email' or 'whatsapp'
    
    await bookingService.resendTicket(id, req.user.id, method);

    res.json({
      success: true,
      message: `Ticket sent via ${method} successfully`
    });
  } catch (error) {
    next(error);
  }
};

export const getEventBookings = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 50, search, status } = req.query;
    
    const result = await bookingService.getEventBookings(eventId, req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      status
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const exportBookings = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { format = 'csv' } = req.query;
    
    const filePath = await bookingService.exportBookings(eventId, req.user.id, format);
    
    res.download(filePath);
  } catch (error) {
    next(error);
  }
};