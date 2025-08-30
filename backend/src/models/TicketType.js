import mongoose from 'mongoose';

const ticketTypeSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Ticket type name is required'],
    enum: ['General', 'VIP', 'Student', 'EarlyBird'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  saleStartAt: {
    type: Date,
    required: [true, 'Sale start date is required']
  },
  saleEndAt: {
    type: Date,
    required: [true, 'Sale end date is required']
  },
  maxQuantity: {
    type: Number,
    required: [true, 'Maximum quantity is required'],
    min: [1, 'Maximum quantity must be at least 1']
  },
  remainingQuantity: {
    type: Number,
    required: true
  },
  perUserLimit: {
    type: Number,
    default: 5,
    min: [1, 'Per user limit must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
ticketTypeSchema.index({ saleStartAt: 1, saleEndAt: 1 });

// Set remaining quantity to max quantity initially
ticketTypeSchema.pre('save', function(next) {
  if (this.isNew) {
    this.remainingQuantity = this.maxQuantity;
  }
  next();
});

// Validate sale dates
ticketTypeSchema.pre('save', function(next) {
  if (this.saleEndAt <= this.saleStartAt) {
    next(new Error('Sale end date must be after sale start date'));
  }
  next();
});

export default mongoose.model('TicketType', ticketTypeSchema);