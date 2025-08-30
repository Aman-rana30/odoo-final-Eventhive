const User = require('../models/User');
const Event = require('../models/Event');
const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const Review = require('../models/Review');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    // Get user stats
    const totalOrders = await Order.countDocuments({ user: req.user.id, status: 'confirmed' });
    const totalTickets = await Ticket.countDocuments({ purchaser: req.user.id });
    const totalReviews = await Review.countDocuments({ user: req.user.id });

    const userStats = {
      totalOrders,
      totalTickets,
      totalReviews,
      loyaltyPoints: user.loyaltyPoints,
      badges: user.badges
    };

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: userStats
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      location: req.body.location,
      interests: req.body.interests
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    // Get upcoming events user has tickets for
    const upcomingEvents = await Order.find({
      user: req.user.id,
      status: 'confirmed'
    })
    .populate({
      path: 'event',
      match: { startDate: { $gte: new Date() } },
      select: 'title startDate venue banner'
    })
    .limit(5);

    // Filter out null events (past events)
    const validUpcomingEvents = upcomingEvents.filter(order => order.event);

    // Get recent orders
    const recentOrders = await Order.find({ user: req.user.id })
      .populate('event', 'title startDate venue banner')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recommended events based on user interests
    const user = await User.findById(req.user.id);
    let recommendedEvents = [];

    if (user.interests && user.interests.length > 0) {
      recommendedEvents = await Event.find({
        status: 'published',
        startDate: { $gte: new Date() },
        $or: [
          { category: { $in: user.interests } },
          { tags: { $in: user.interests } }
        ]
      })
      .limit(6)
      .select('title startDate venue banner ticketTypes category');
    }

    // If no interest-based recommendations, get trending events
    if (recommendedEvents.length === 0) {
      recommendedEvents = await Event.find({
        status: 'published',
        startDate: { $gte: new Date() },
        trending: true
      })
      .limit(6)
      .select('title startDate venue banner ticketTypes category');
    }

    // Get user activity summary
    const activitySummary = {
      totalAttended: await Ticket.countDocuments({
        purchaser: req.user.id,
        'checkIn.isCheckedIn': true
      }),
      totalSpent: await Order.aggregate([
        { $match: { user: req.user.id, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      favoriteCategory: await Order.aggregate([
        { $match: { user: req.user.id, status: 'confirmed' } },
        {
          $lookup: {
            from: 'events',
            localField: 'event',
            foreignField: '_id',
            as: 'eventData'
          }
        },
        { $unwind: '$eventData' },
        {
          $group: {
            _id: '$eventData.category',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ])
    };

    res.status(200).json({
      success: true,
      data: {
        upcomingEvents: validUpcomingEvents,
        recentOrders,
        recommendedEvents,
        activitySummary: {
          totalAttended: activitySummary.totalAttended,
          totalSpent: activitySummary.totalSpent[0]?.total || 0,
          favoriteCategory: activitySummary.favoriteCategory[0]?._id || 'None'
        },
        user: {
          firstName: user.firstName,
          loyaltyPoints: user.loyaltyPoints,
          badges: user.badges
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

// @desc    Get user's event history
// @route   GET /api/users/history
// @access  Private
exports.getEventHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .populate('event', 'title startDate venue banner category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ user: req.user.id });

    // Group orders by status for easy filtering
    const ordersByStatus = {
      confirmed: orders.filter(order => order.status === 'confirmed'),
      pending: orders.filter(order => order.status === 'pending'),
      cancelled: orders.filter(order => order.status === 'cancelled'),
      refunded: orders.filter(order => order.status === 'refunded')
    };

    res.status(200).json({
      success: true,
      data: {
        orders,
        ordersByStatus,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders
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

// @desc    Get user's tickets
// @route   GET /api/users/tickets
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

    // Categorize tickets
    const now = new Date();
    const categorizedTickets = {
      upcoming: tickets.filter(ticket => 
        new Date(ticket.event.startDate) > now && ticket.status === 'active'
      ),
      past: tickets.filter(ticket => 
        new Date(ticket.event.startDate) <= now || ticket.checkIn.isCheckedIn
      ),
      cancelled: tickets.filter(ticket => 
        ticket.status === 'cancelled' || ticket.status === 'refunded'
      )
    };

    res.status(200).json({
      success: true,
      data: {
        tickets,
        categorizedTickets,
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

// @desc    Add event to favorites
// @route   POST /api/users/favorites/:eventId
// @access  Private
exports.addToFavorites = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const user = await User.findById(req.user.id);

    // Check if already in favorites
    if (user.favorites && user.favorites.includes(req.params.eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Event already in favorites'
      });
    }

    // Add to favorites
    if (!user.favorites) user.favorites = [];
    user.favorites.push(req.params.eventId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Event added to favorites'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Remove event from favorites
// @route   DELETE /api/users/favorites/:eventId
// @access  Private
exports.removeFromFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.favorites || !user.favorites.includes(req.params.eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Event not in favorites'
      });
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(eventId => 
      eventId.toString() !== req.params.eventId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Event removed from favorites'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get user's favorite events
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      match: { status: 'published' },
      select: 'title startDate venue banner ticketTypes category'
    });

    res.status(200).json({
      success: true,
      data: user.favorites || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create event review
// @route   POST /api/users/reviews/:eventId
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    // Check if user has attended the event
    const hasAttended = await Ticket.findOne({
      purchaser: req.user.id,
      event: req.params.eventId,
      'checkIn.isCheckedIn': true
    });

    if (!hasAttended) {
      return res.status(400).json({
        success: false,
        message: 'You can only review events you have attended'
      });
    }

    // Check if user has already reviewed this event
    const existingReview = await Review.findOne({
      user: req.user.id,
      event: req.params.eventId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this event'
      });
    }

    const review = await Review.create({
      user: req.user.id,
      event: req.params.eventId,
      rating,
      comment,
      verified: true // Mark as verified since user attended
    });

    // Update event rating
    const allReviews = await Review.find({ event: req.params.eventId });
    const avgRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;

    await Event.findByIdAndUpdate(req.params.eventId, {
      'rating.average': avgRating.toFixed(1),
      'rating.count': allReviews.length
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/users/reviews
// @access  Private
exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('event', 'title banner startDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
