const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  maxPerUser: {
    type: Number,
    default: 5
  },
  saleStartDate: Date,
  saleEndDate: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: String,
  category: {
    type: String,
    required: true,
    enum: ['music', 'sports', 'technology', 'business', 'education', 'entertainment', 'workshop', 'hackathon', 'conference', 'other']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: String,
  endTime: String,
  venue: {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    capacity: Number
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    url: String,
    public_id: String
  }],
  banner: {
    url: String,
    public_id: String
  },
  ticketTypes: [ticketTypeSchema],
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  totalTicketsSold: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  socialLinks: {
    website: String,
    facebook: String,
    twitter: String,
    instagram: String
  },
  requirements: [String],
  refundPolicy: {
    type: String,
    default: 'No refunds available'
  },
  ageRestriction: {
    minAge: Number,
    maxAge: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search and filtering
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ category: 1, startDate: 1 });
eventSchema.index({ 'venue.city': 1, startDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
