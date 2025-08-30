import mongoose from 'mongoose';
import slugify from 'slugify';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['workshop', 'concert', 'sports', 'hackathon', 'conference', 'seminar', 'exhibition', 'festival', 'other']
  },
  coverImageUrl: {
    type: String,
    default: ''
  },
  venue: {
    address: {
      type: String,
      required: [true, 'Venue address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    country: {
      type: String,
      default: 'India'
    },
    lat: Number,
    lng: Number,
    type: {
      type: String,
      enum: ['indoor', 'outdoor'],
      default: 'indoor'
    }
  },
  startAt: {
    type: Date,
    required: [true, 'Start date and time is required']
  },
  endAt: {
    type: Date,
    required: [true, 'End date and time is required']
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Cancelled', 'Completed'],
    default: 'Draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  trendingScore: {
    type: Number,
    default: 0
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  capacity: {
    type: Number,
    required: [true, 'Event capacity is required'],
    min: 1
  },
  ticketsSold: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  seoMeta: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes
eventSchema.index({ slug: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ startAt: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ featured: 1 });
eventSchema.index({ trendingScore: -1 });
eventSchema.index({ 'venue.city': 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ title: 'text', description: 'text' });

// Generate slug before saving
eventSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  
  // Auto-generate SEO meta if not provided
  if (!this.seoMeta.title) {
    this.seoMeta.title = this.title;
  }
  if (!this.seoMeta.description) {
    this.seoMeta.description = this.description.substring(0, 160);
  }
  
  next();
});

// Validate end date is after start date
eventSchema.pre('save', function(next) {
  if (this.endAt <= this.startAt) {
    next(new Error('End date must be after start date'));
  }
  next();
});

export default mongoose.model('Event', eventSchema);