const User = require('../models/User');
const Event = require('../models/Event');
const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonth },
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topEvents = await Event.find({ status: 'published' })
      .sort({ totalTicketsSold: -1 })
      .limit(5)
      .select('title totalTicketsSold totalRevenue category startDate');

    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .populate('event', 'title startDate')
      .sort({ createdAt: -1 })
      .limit(10);

    const categoryStats = await Event.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalRevenue' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalEvents,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        monthlyStats,
        topEvents,
        recentOrders,
        categoryStats
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

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role;
    }

    // Filter by verification status
    if (req.query.verified !== undefined) {
      query.isVerified = req.query.verified === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers
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

// @desc    Update user status
// @route   PUT /api/admin/users/:userId
// @access  Private (Admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isVerified } = req.body;

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow changing other admins
    if (user.role === 'admin' && req.user.id !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify other admin users'
      });
    }

    if (role !== undefined) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
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

// @desc    Get all events for admin
// @route   GET /api/admin/events
// @access  Private (Admin only)
exports.getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    // Filter by category
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Search by title
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalEvents = await Event.countDocuments(query);

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

// @desc    Update event status
// @route   PUT /api/admin/events/:eventId
// @access  Private (Admin only)
exports.updateEvent = async (req, res, next) => {
  try {
    const { status, featured, trending } = req.body;

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (status !== undefined) event.status = status;
    if (featured !== undefined) event.featured = featured;
    if (trending !== undefined) event.trending = trending;

    await event.save();

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

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin only)
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .populate('event', 'title startDate category')
      .populate('payment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
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

// @desc    Create coupon
// @route   POST /api/admin/coupons
// @access  Private (Admin only)
exports.createCoupon = async (req, res, next) => {
  try {
    const couponData = {
      ...req.body,
      createdBy: req.user.id,
      code: req.body.code.toUpperCase()
    };

    const coupon = await Coupon.create(couponData);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private (Admin only)
exports.getCoupons = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const coupons = await Coupon.find()
      .populate('createdBy', 'firstName lastName')
      .populate('applicableEvents', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCoupons = await Coupon.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        coupons,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCoupons / limit),
          totalCoupons
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

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:couponId
// @access  Private (Admin only)
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.couponId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:couponId
// @access  Private (Admin only)
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.couponId);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check if coupon has been used
    if (coupon.usedCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete coupon that has been used'
      });
    }

    await Coupon.findByIdAndDelete(req.params.couponId);

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Revenue analytics
    const revenueStats = await Order.aggregate([
      { $match: { status: 'confirmed', ...dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: '$pricing.total' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$pricing.total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // User growth analytics
    const userGrowth = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Event analytics by category
    const eventsByCategory = await Event.aggregate([
      { $match: { status: 'published', ...dateFilter } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalRevenue' },
          avgTicketPrice: { $avg: '$ticketTypes.price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top performing events
    const topEvents = await Event.find({ status: 'published' })
      .sort({ totalRevenue: -1 })
      .limit(10)
      .select('title totalRevenue totalTicketsSold category startDate')
      .populate('organizer', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: {
        revenueStats,
        userGrowth,
        eventsByCategory,
        topEvents
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

// @desc    Export data
// @route   GET /api/admin/export/:type
// @access  Private (Admin only)
exports.exportData = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let data, filename;

    const dateFilter = startDate && endDate ? {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    } : {};

    switch (type) {
      case 'users':
        data = await User.find(dateFilter).select('-password').lean();
        filename = `users_${Date.now()}.csv`;
        break;

      case 'events':
        data = await Event.find(dateFilter)
          .populate('organizer', 'firstName lastName email')
          .lean();
        filename = `events_${Date.now()}.csv`;
        break;

      case 'orders':
        data = await Order.find({ ...dateFilter, status: 'confirmed' })
          .populate('user', 'firstName lastName email')
          .populate('event', 'title category')
          .lean();
        filename = `orders_${Date.now()}.csv`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    // Convert to CSV (simplified - in production use a proper CSV library)
    const csv = convertToCSV(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object');
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value}"` : value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}
