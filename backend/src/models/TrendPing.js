import mongoose from 'mongoose';

const trendPingSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  action: {
    type: String,
    enum: ['view', 'addToCart', 'purchase'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  ip: String
}, {
  timestamps: true
});

// Indexes
trendPingSchema.index({ eventId: 1, action: 1 });
trendPingSchema.index({ createdAt: 1 });

export default mongoose.model('TrendPing', trendPingSchema);
```