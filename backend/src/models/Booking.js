import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  items: [{
    ticketTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TicketType',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    priceAtPurchase: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  attendeeInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  couponCode: String,
  payment: {
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'dummy'],
      required: true
    },
    orderId: String,
    paymentId: String,
    signature: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  qrCodeUrl: String,
  pdfUrl: String,
  delivery: {
    emailed: {
      type: Boolean,
      default: false
    },
    whatsapped: {
      type: Boolean,
      default: false
    },
    emailedAt: Date,
    whatsappedAt: Date
  },
  refund: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    gatewayRefundId: String
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: Date,
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ userId: 1 });
bookingSchema.index({ eventId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'payment.status': 1 });

export default mongoose.model('Booking', bookingSchema);