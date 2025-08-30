import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import reportService from '../services/reportService.js';

const router = express.Router();

// Sales reports
router.get('/sales/:eventId', authenticate, authorize('EventManager', 'Admin'), async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { startDate, endDate } = req.query;
    
    const report = await reportService.getSalesReport(eventId, req.user.id, {
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    });

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
});

// Attendee reports
router.get('/attendees/:eventId', authenticate, authorize('EventManager', 'Admin'), async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const report = await reportService.getAttendeeReport(eventId, req.user.id);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
});

// Export functionality
router.get('/export/:eventId/:format', authenticate, authorize('EventManager', 'Admin'), async (req, res, next) => {
  try {
    const { eventId, format } = req.params;
    const filePath = await reportService.exportEventData(eventId, req.user.id, format);
    
    res.download(filePath);
  } catch (error) {
    next(error);
  }
});

export default router;