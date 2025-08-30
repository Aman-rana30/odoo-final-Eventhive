import checkinService from '../services/checkinService.js';

export const scanQR = async (req, res, next) => {
  try {
    const { qrPayload, bookingId } = req.body;
    
    const result = await checkinService.processCheckin({
      qrPayload,
      bookingId,
      scannedBy: req.user.id,
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getEventCheckinStats = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const stats = await checkinService.getEventCheckinStats(eventId, req.user.id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

export const getCheckinHistory = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const result = await checkinService.getCheckinHistory(eventId, req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const searchBooking = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { query } = req.query;
    
    const bookings = await checkinService.searchBookings(eventId, query, req.user.id);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};