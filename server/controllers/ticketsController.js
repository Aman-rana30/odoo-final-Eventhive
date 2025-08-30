const Ticket = require('../models/Ticket');
const Order = require('../models/Order');
const Event = require('../models/Event');
const User = require('../models/User');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// @desc    Get user tickets
// @route   GET /api/tickets
// @access  Private
exports.getUserTickets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tickets = await Ticket.find({ purchaser: req.user.id })
      .populate('event', 'title startDate venue banner')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTickets = await Ticket.countDocuments({ purchaser: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTickets / limit),
          totalTickets
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:ticketId
// @access  Private
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId })
      .populate('event')
      .populate('purchaser', 'firstName lastName email phone');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user owns the ticket or is organizer/admin
    const event = await Event.findById(ticket.event._id);
    const isOwner = ticket.purchaser._id.toString() === req.user.id;
    const isOrganizer = event.organizer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this ticket'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Verify ticket QR code
// @route   POST /api/tickets/verify
// @access  Private
exports.verifyTicket = async (req, res, next) => {
  try {
    const { ticketId, qrCode } = req.body;

    const ticket = await Ticket.findOne({ ticketId })
      .populate('event', 'title startDate endDate venue organizer')
      .populate('purchaser', 'firstName lastName email phone');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Verify QR code matches
    if (ticket.qrCode !== qrCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    // Check if ticket is active
    if (ticket.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Ticket is ${ticket.status}`
      });
    }

    // Check if event has started (allow check-in 2 hours before)
    const eventStart = new Date(ticket.event.startDate);
    const checkInStart = new Date(eventStart.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
    const now = new Date();

    if (now < checkInStart) {
      return res.status(400).json({
        success: false,
        message: 'Check-in not yet available'
      });
    }

    // Check if event has ended
    if (now > new Date(ticket.event.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Event has already ended'
      });
    }

    // Check if already checked in
    if (ticket.checkIn.isCheckedIn) {
      return res.status(400).json({
        success: false,
        message: `Already checked in at ${ticket.checkIn.checkInTime}`,
        data: {
          checkInTime: ticket.checkIn.checkInTime,
          checkInLocation: ticket.checkIn.checkInLocation
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket verified successfully',
      data: {
        ticket,
        canCheckIn: true
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Check in ticket
// @route   POST /api/tickets/checkin
// @access  Private (Organizers/Admins only)
exports.checkInTicket = async (req, res, next) => {
  try {
    const { ticketId, location } = req.body;

    const ticket = await Ticket.findOne({ ticketId })
      .populate('event', 'title startDate endDate organizer')
      .populate('purchaser', 'firstName lastName');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check authorization
    const isOrganizer = ticket.event.organizer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to check in tickets for this event'
      });
    }

    // Check if already checked in
    if (ticket.checkIn.isCheckedIn) {
      return res.status(400).json({
        success: false,
        message: 'Ticket already checked in'
      });
    }

    // Check if ticket is active
    if (ticket.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in ${ticket.status} ticket`
      });
    }

    // Update ticket check-in status
    ticket.checkIn.isCheckedIn = true;
    ticket.checkIn.checkInTime = new Date();
    ticket.checkIn.checkInLocation = location || 'Main Entrance';
    ticket.checkIn.checkInBy = req.user.id;
    ticket.status = 'used';

    await ticket.save();

    // Update user loyalty points
    const user = await User.findById(ticket.purchaser._id);
    user.loyaltyPoints += 10; // Award 10 points for attendance
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Ticket checked in successfully',
      data: {
        ticket,
        attendee: ticket.purchaser
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Generate ticket PDF
// @route   GET /api/tickets/:ticketId/pdf
// @access  Private
exports.generateTicketPDF = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId })
      .populate('event')
      .populate('purchaser', 'firstName lastName email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user owns the ticket
    if (ticket.purchaser._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this ticket'
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticket.ticketId}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('EventMitra Ticket', { align: 'center' });
    doc.moveDown();

    // Event details
    doc.fontSize(16).text(ticket.event.title, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Event Date: ${new Date(ticket.event.startDate).toLocaleDateString()}`, { align: 'left' });
    doc.text(`Event Time: ${ticket.event.startTime || 'TBD'}`, { align: 'left' });
    doc.text(`Venue: ${ticket.event.venue.name}`, { align: 'left' });
    doc.text(`Address: ${ticket.event.venue.address}`, { align: 'left' });
    doc.moveDown();

    // Ticket details
    doc.text(`Ticket ID: ${ticket.ticketId}`, { align: 'left' });
    doc.text(`Ticket Type: ${ticket.ticketType.name}`, { align: 'left' });
    doc.text(`Price: ₹${ticket.ticketType.price}`, { align: 'left' });
    doc.moveDown();

    // Attendee details
    doc.text(`Attendee: ${ticket.attendee.firstName} ${ticket.attendee.lastName}`, { align: 'left' });
    doc.text(`Email: ${ticket.attendee.email}`, { align: 'left' });
    doc.moveDown();

    // Generate QR Code
    const qrCodeBuffer = await QRCode.toBuffer(ticket.qrCode, { width: 200 });
    doc.image(qrCodeBuffer, doc.page.width / 2 - 100, doc.y, { width: 200 });

    doc.moveDown(8);
    doc.text('Scan QR code at venue for entry', { align: 'center' });

    // Footer
    doc.fontSize(10);
    doc.text('Please bring this ticket to the event venue', { align: 'center' });
    doc.text('For support, contact: support@eventmitra.com', { align: 'center' });

    // End PDF
    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF'
    });
  }
};

// @desc    Transfer ticket
// @route   POST /api/tickets/:ticketId/transfer
// @access  Private
exports.transferTicket = async (req, res, next) => {
  try {
    const { email } = req.body;

    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId })
      .populate('event');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user owns the ticket
    if (ticket.purchaser.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to transfer this ticket'
      });
    }

    // Check if transfer is allowed (not within 24 hours of event)
    const eventStart = new Date(ticket.event.startDate);
    const now = new Date();
    const hoursDiff = (eventStart - now) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer ticket within 24 hours of event'
      });
    }

    // Find recipient user
    const recipient = await User.findOne({ email });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found'
      });
    }

    // Update ticket ownership
    const oldOwner = ticket.purchaser;
    ticket.purchaser = recipient._id;
    ticket.transferHistory.push({
      from: oldOwner,
      to: recipient._id,
      transferDate: new Date()
    });

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket transferred successfully',
      data: ticket
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get event check-in stats
// @route   GET /api/tickets/event/:eventId/checkin-stats
// @access  Private (Organizers only)
exports.getCheckInStats = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check authorization
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view check-in stats for this event'
      });
    }

    const tickets = await Ticket.find({ event: req.params.eventId });

    const stats = {
      totalTickets: tickets.length,
      checkedIn: tickets.filter(t => t.checkIn.isCheckedIn).length,
      pending: tickets.filter(t => !t.checkIn.isCheckedIn && t.status === 'active').length,
      cancelled: tickets.filter(t => t.status === 'cancelled').length,
      checkInRate: tickets.length > 0 ? (tickets.filter(t => t.checkIn.isCheckedIn).length / tickets.length * 100).toFixed(2) : 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
