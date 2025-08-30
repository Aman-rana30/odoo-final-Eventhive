const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// @desc    Create order and initiate payment
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { eventId, tickets, contactInfo, couponCode } = req.body;

    // Get event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is published and not expired
    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Event is not available for booking'
      });
    }

    if (new Date(event.startDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event has already started'
      });
    }

    // Validate tickets and calculate pricing
    let subtotal = 0;
    const ticketDetails = [];

    for (const ticketItem of tickets) {
      const ticketType = event.ticketTypes.find(t => t.name === ticketItem.ticketType);

      if (!ticketType) {
        return res.status(400).json({
          success: false,
          message: `Ticket type ${ticketItem.ticketType} not found`
        });
      }

      // Check availability
      const availableQuantity = ticketType.quantity - ticketType.sold;
      if (ticketItem.quantity > availableQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableQuantity} tickets available for ${ticketType.name}`
        });
      }

      // Check per user limit
      if (ticketItem.quantity > ticketType.maxPerUser) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${ticketType.maxPerUser} tickets allowed per user for ${ticketType.name}`
        });
      }

      const ticketTotal = ticketType.price * ticketItem.quantity;
      subtotal += ticketTotal;

      ticketDetails.push({
        ticketType: ticketType.name,
        quantity: ticketItem.quantity,
        price: ticketType.price,
        attendees: ticketItem.attendees || []
      });
    }

    // Apply coupon if provided
    let discount = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired coupon code'
        });
      }

      // Check usage limits
      if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({
          success: false,
          message: 'Coupon usage limit exceeded'
        });
      }

      // Check user limit
      const userUsage = coupon.usedBy.filter(usage => 
        usage.user.toString() === req.user.id
      ).length;

      if (userUsage >= coupon.userLimit) {
        return res.status(400).json({
          success: false,
          message: 'Coupon usage limit per user exceeded'
        });
      }

      // Check minimum amount
      if (subtotal < coupon.minimumAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount ₹${coupon.minimumAmount} required for this coupon`
        });
      }

      // Calculate discount
      if (coupon.discountType === 'percentage') {
        discount = subtotal * (coupon.discountValue / 100);
        if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
          discount = coupon.maximumDiscount;
        }
      } else {
        discount = coupon.discountValue;
      }

      discount = Math.min(discount, subtotal);
    }

    // Calculate final pricing
    const processingFee = Math.round(subtotal * 0.02); // 2% processing fee
    const taxes = Math.round((subtotal - discount) * 0.18); // 18% GST
    const total = subtotal - discount + processingFee + taxes;

    // Create order in database
    const order = await Order.create({
      user: req.user.id,
      event: eventId,
      tickets: ticketDetails,
      pricing: {
        subtotal,
        discount,
        taxes,
        processingFee,
        total
      },
      coupon: coupon ? {
        code: coupon.code,
        discount,
        discountType: coupon.discountType
      } : undefined,
      contactInfo,
      status: 'pending'
    });

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100, // Amount in paisa
      currency: 'INR',
      receipt: order.orderId,
      payment_capture: 1
    });

    // Create payment record
    const payment = await Payment.create({
      razorpayOrderId: razorpayOrder.id,
      order: order._id,
      user: req.user.id,
      amount: total,
      status: 'created'
    });

    // Update order with payment reference
    order.payment = payment._id;
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
        razorpayOrder,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
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

// @desc    Verify payment and confirm order
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Find order and payment
    const order = await Order.findOne({ orderId }).populate('event');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const payment = await Payment.findById(order.payment);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Update payment status
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'captured';
    payment.capturedAt = new Date();
    await payment.save();

    // Update order status
    order.status = 'confirmed';
    await order.save();

    // Update event ticket sales
    const event = await Event.findById(order.event._id);
    let totalTicketsSold = 0;

    for (const ticketItem of order.tickets) {
      const ticketType = event.ticketTypes.find(t => t.name === ticketItem.ticketType);
      if (ticketType) {
        ticketType.sold += ticketItem.quantity;
        totalTicketsSold += ticketItem.quantity;
      }
    }

    event.totalTicketsSold += totalTicketsSold;
    event.totalRevenue += order.pricing.total;
    await event.save();

    // Update coupon usage
    if (order.coupon && order.coupon.code) {
      await Coupon.updateOne(
        { code: order.coupon.code },
        { 
          $inc: { usedCount: 1 },
          $push: { usedBy: { user: req.user.id, order: order._id } }
        }
      );
    }

    // Generate tickets
    const tickets = [];
    for (const ticketItem of order.tickets) {
      for (let i = 0; i < ticketItem.quantity; i++) {
        const attendee = ticketItem.attendees[i] || {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: order.contactInfo.email,
          phone: order.contactInfo.phone
        };

        // Generate QR code data
        const qrData = {
          ticketId: `TKT${Date.now()}${Math.floor(Math.random() * 1000)}`,
          eventId: order.event._id,
          userId: req.user.id,
          timestamp: new Date().toISOString()
        };

        const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

        const ticket = await Ticket.create({
          ticketId: qrData.ticketId,
          qrCode,
          event: order.event._id,
          order: order._id,
          ticketType: {
            name: ticketItem.ticketType,
            price: ticketItem.price
          },
          attendee,
          purchaser: req.user.id
        });

        tickets.push(ticket);
      }
    }

    // Send confirmation email
    try {
      const transporter = createEmailTransporter();

      await transporter.sendMail({
        from: `EventMitra <${process.env.EMAIL_USER}>`,
        to: order.contactInfo.email,
        subject: `Booking Confirmed - ${event.title}`,
        html: `
          <h2>Booking Confirmation</h2>
          <p>Dear ${req.user.firstName},</p>
          <p>Your booking for <strong>${event.title}</strong> has been confirmed!</p>

          <h3>Event Details:</h3>
          <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${event.startTime || 'TBD'}</p>
          <p><strong>Venue:</strong> ${event.venue.name}, ${event.venue.address}</p>

          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Total Amount:</strong> ₹${order.pricing.total}</p>
          <p><strong>Tickets:</strong> ${tickets.length}</p>

          <p>Your tickets have been generated and you can view them in your EventMitra account.</p>

          <p>Thank you for choosing EventMitra!</p>
        `
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    // Award loyalty points
    const user = await User.findById(req.user.id);
    user.loyaltyPoints += Math.floor(order.pricing.total / 100); // 1 point per ₹100 spent
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed',
      data: {
        order,
        tickets,
        loyaltyPointsEarned: Math.floor(order.pricing.total / 100)
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

// @desc    Get user orders
// @route   GET /api/payments/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .populate('event', 'title startDate venue banner')
      .populate('payment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ user: req.user.id });

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

// @desc    Get single order
// @route   GET /api/payments/orders/:orderId
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('event')
      .populate('payment');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    // Get tickets for this order
    const tickets = await Ticket.find({ order: order._id });

    res.status(200).json({
      success: true,
      data: {
        order,
        tickets
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

// @desc    Process refund
// @route   POST /api/payments/refund/:orderId
// @access  Private
exports.processRefund = async (req, res, next) => {
  try {
    const { reason, amount } = req.body;

    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('event')
      .populate('payment');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to refund this order'
      });
    }

    // Check if refund is allowed
    const event = order.event;
    const eventStart = new Date(event.startDate);
    const now = new Date();
    const hoursDiff = (eventStart - now) / (1000 * 60 * 60);

    if (hoursDiff < 48) {
      return res.status(400).json({
        success: false,
        message: 'Refunds not allowed within 48 hours of event'
      });
    }

    // Calculate refund amount (deduct processing fees)
    const refundAmount = amount || (order.pricing.total - order.pricing.processingFee);

    try {
      // Process Razorpay refund
      const refund = await razorpay.payments.refund(order.payment.razorpayPaymentId, {
        amount: refundAmount * 100, // Amount in paisa
        speed: 'normal'
      });

      // Update order
      order.status = refundAmount === order.pricing.total ? 'refunded' : 'partially_refunded';
      order.refunds.push({
        amount: refundAmount,
        reason,
        processedAt: new Date(),
        refundId: refund.id
      });

      await order.save();

      // Update payment
      const payment = order.payment;
      payment.refunds.push({
        refundId: refund.id,
        amount: refundAmount,
        reason,
        status: refund.status,
        processedAt: new Date()
      });

      if (refundAmount === order.pricing.total) {
        payment.status = 'refunded';
      }

      await payment.save();

      // Cancel tickets
      await Ticket.updateMany(
        { order: order._id },
        { status: 'refunded' }
      );

      // Update event stats
      const totalTicketsToRefund = order.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
      await Event.findByIdAndUpdate(event._id, {
        $inc: {
          totalTicketsSold: -totalTicketsToRefund,
          totalRevenue: -refundAmount
        }
      });

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          refundAmount,
          refundId: refund.id,
          order
        }
      });

    } catch (razorpayError) {
      console.error('Razorpay refund error:', razorpayError);
      return res.status(500).json({
        success: false,
        message: 'Error processing refund with payment gateway'
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Apply coupon code
// @route   POST /api/payments/apply-coupon
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { couponCode, eventId, amount } = req.body;

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired coupon code'
      });
    }

    // Check usage limits
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit exceeded'
      });
    }

    // Check user limit
    const userUsage = coupon.usedBy.filter(usage => 
      usage.user.toString() === req.user.id
    ).length;

    if (userUsage >= coupon.userLimit) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this coupon'
      });
    }

    // Check minimum amount
    if (amount < coupon.minimumAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount ₹${coupon.minimumAmount} required for this coupon`
      });
    }

    // Check if applicable to event
    if (coupon.applicableEvents.length > 0 && !coupon.applicableEvents.includes(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Coupon not applicable to this event'
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = amount * (coupon.discountValue / 100);
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, amount);

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        coupon: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue
        },
        discount,
        newTotal: amount - discount
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
