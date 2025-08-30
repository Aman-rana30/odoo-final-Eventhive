import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9]{3,20}$/, 'Coupon code must be 3-20 alphanumeric characters']
  },
  type: {
    type: String,
    required: [true, 'Coupon type is required'],
    enum: ['PERCENT', 'FIXED', 'BOGO', 'GROUP']
  },
  value: {
    type: Number,
    required: [true, 'Coupon value is required'],
    min: [0, 'Value cannot be negative']
  },
  minAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum amount cannot be negative']
  },
  maxDiscount: {
    type: Number,
    min: [0, 'Maximum discount cannot be negative']
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required']
  },
  validTo: {
    type: Date,
    required: [true, 'Valid to date is required']
  },
  usageLimitGlobal: {
    type: Number,
    min: [1, 'Global usage limit must be at least 1']
  },
  usagePerUser: {
    type: Number,
    default: 1,
    min: [1, 'Usage per user must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0
  },
  applicableEventIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ validFrom: 1, validTo: 1 });
couponSchema.index({ active: 1 });

// Validate dates
couponSchema.pre('save', function(next) {
  if (this.validTo <= this.validFrom) {
    next(new Error('Valid to date must be after valid from date'));
  }
  next();
});

export default mongoose.model('Coupon', couponSchema);
```