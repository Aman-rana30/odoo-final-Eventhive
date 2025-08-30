import mongoose from 'mongoose';

const checkinSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scannedAt: {
    type: Date,
    default: Date.now
  },
  deviceInfo: {
    userAgent: String,
    ip: String
  }
}, {
  timestamps: true
});

// Indexes
checkinSchema.index({ bookingId: 1 });
checkinSchema.index({ eventId: 1 });
checkinSchema.index({ scannedBy: 1 });

export default mongoose.model('Checkin', checkinSchema);
```