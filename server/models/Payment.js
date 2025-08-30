const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: String,
  razorpayOrderId: String,
  razorpaySignature: String,
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  method: {
    type: String,
    enum: ['card', 'netbanking', 'upi', 'wallet', 'emi'],
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    default: 'created'
  },
  gateway: {
    type: String,
    default: 'razorpay'
  },
  gatewayData: {
    type: mongoose.Schema.Types.Mixed
  },
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: String,
    processedAt: Date
  }],
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  capturedAt: Date,
  failureReason: String
});

// Generate unique payment ID
paymentSchema.pre('save', function(next) {
  if (!this.paymentId) {
    this.paymentId = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
