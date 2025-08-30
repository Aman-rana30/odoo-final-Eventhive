const Event = require('../models/Event');
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { status: 'published' };

    // Category filter
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Location filter
    if (req.query.city) {
      query['venue.city'] = new RegExp(req.query.city, 'i');
    }

    // Date filter
    if (req.query.date) {
      const startOfDay = new Date(req.query.date);
      const endOfDay = new Date(req.query.date);
      endOfDay.setHours(23, 59, 59, 999);

      query.startDate = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    // Price filter
    if (req.query.minPrice || req.query.maxPrice) {
      query['ticketTypes.price'] = {};
      if (req.query.minPrice) {
        query['ticketTypes.price'].$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query['ticketTypes.price'].$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Text search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Sort options
    let sortBy = { createdAt: -1 };
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'date':
          sortBy = { startDate: 1 };
          break;
        case 'price_low':
          sortBy = { 'ticketTypes.price': 1 };
          break;
        case 'price_high':
          sortBy = { 'ticketTypes.price': -1 };
          break;
        case 'popular':
          sortBy = { totalTicketsSold: -1 };
          break;
        case 'rating':
          sortBy = { 'rating.average': -1 };
          break;
      }
    }

    // Execute query
    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName avatar')
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalEvents = await Event.countDocuments(query);
    const totalPages = Math.ceil(totalEvents / limit);

    // Get featured events if no specific query
    let featuredEvents = [];
    if (page === 1 && !req.query.search && !req.query.category) {
      featuredEvents = await Event.find({ 
        status: 'published', 
        featured: true,
        startDate: { $gte: new Date() }
      })
      .populate('organizer', 'firstName lastName avatar')
      .limit(6)
      .lean();
    }

    res.status(200).json({
      success: true,
      data: {
        events,
        featuredEvents,
        pagination: {
          currentPage: page,
          totalPages,
          totalEvents,
          hasNext: page < totalPages,
          hasPrev: page > 1
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

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email phone avatar')
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get reviews
    const reviews = await Review.find({ event: req.params.id })
      .populate('user', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Check if user has purchased ticket (if authenticated)
    let hasPurchased = false;
    if (req.user) {
      const userOrder = await Order.findOne({
        user: req.user._id,
        event: req.params.id,
        status: 'confirmed'
      });
      hasPurchased = !!userOrder;
    }

    res.status(200).json({
      success: true,
      data: {
        event,
        reviews,
        hasPurchased
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

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizers only)
exports.createEvent = async (req, res, next) => {
  try {
    req.body.organizer = req.user.id;

    // Validate dates
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (startDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizers only)
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Don't allow updates if event has started
    if (new Date(event.startDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update event that has already started'
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizers only)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    // Check if event has orders
    const orders = await Order.countDocuments({ event: req.params.id });
    if (orders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with existing bookings'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Upload event images
// @route   POST /api/events/:id/upload
// @access  Private (Organizers only)
exports.uploadEventImages = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload images for this event'
      });
    }

    if (!req.files || !req.files.images) {
      return res.status(400).json({
        success: false,
        message: 'Please upload images'
      });
    }

    const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    const uploadedImages = [];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'eventmitra/events',
        width: 1200,
        height: 800,
        crop: 'limit'
      });

      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id
      });
    }

    event.images = [...event.images, ...uploadedImages];
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: uploadedImages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get organizer events
// @route   GET /api/events/organizer/my-events
// @access  Private (Organizers only)
exports.getOrganizerEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const events = await Event.find({ organizer: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalEvents = await Event.countDocuments({ organizer: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalEvents / limit),
          totalEvents
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

// @desc    Get event analytics
// @route   GET /api/events/:id/analytics
// @access  Private (Organizers only)
exports.getEventAnalytics = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this event'
      });
    }

    // Get orders and analytics
    const orders = await Order.find({ event: req.params.id }).populate('user', 'firstName lastName');

    const analytics = {
      totalOrders: orders.length,
      confirmedOrders: orders.filter(order => order.status === 'confirmed').length,
      totalRevenue: orders.reduce((sum, order) => sum + order.pricing.total, 0),
      ticketsSold: event.totalTicketsSold,
      ticketTypes: event.ticketTypes.map(type => ({
        name: type.name,
        sold: type.sold,
        remaining: type.quantity - type.sold,
        revenue: type.sold * type.price
      })),
      recentOrders: orders.slice(-10)
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
