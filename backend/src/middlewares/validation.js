import Joi from 'joi';

const validate = (schema) => {
  return (req, res, next) => {
    console.log('🔍 Validation middleware called');
    console.log('📥 Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('📁 Files:', req.files);
    console.log('📄 Single file:', req.file);
    
    // Handle multipart form data - convert nested fields back to objects
    let dataToValidate = { ...req.body };
    
    // Convert nested venue fields back to object structure
    // Handle both flat format (venue.address) and nested format (venue: {address: ...})
    if (req.body['venue.address'] || req.body['venue.city'] || req.body['venue.state']) {
      console.log('🏢 Processing flat venue fields');
      // Flat format from FormData
      dataToValidate.venue = {
        address: req.body['venue.address'],
        city: req.body['venue.city'],
        state: req.body['venue.state'],
        country: req.body['venue.country'] || 'India',
        type: req.body['venue.type'] || 'indoor'
      };
      
      // Remove the flat venue fields
      delete dataToValidate['venue.address'];
      delete dataToValidate['venue.city'];
      delete dataToValidate['venue.state'];
      delete dataToValidate['venue.country'];
      delete dataToValidate['venue.type'];
    } else if (req.body.venue && typeof req.body.venue === 'object') {
      console.log('🏢 Processing nested venue object');
      // Already in nested format, ensure all required fields are present
      dataToValidate.venue = {
        address: req.body.venue.address,
        city: req.body.venue.city,
        state: req.body.venue.state,
        country: req.body.venue.country || 'India',
        type: req.body.venue.type || 'indoor'
      };
    } else {
      console.log('⚠️ No venue data found');
    }
    
    // Convert date strings to Date objects for validation
    if (dataToValidate.startAt) {
      console.log('📅 Processing startAt:', dataToValidate.startAt);
      const startDate = new Date(dataToValidate.startAt);
      if (isNaN(startDate.getTime())) {
        console.log('❌ Invalid startAt date');
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: [{ field: 'startAt', message: 'Invalid start date format' }]
        });
      }
      dataToValidate.startAt = startDate;
    }
    if (dataToValidate.endAt) {
      console.log('📅 Processing endAt:', dataToValidate.endAt);
      const endDate = new Date(dataToValidate.endAt);
      if (isNaN(endDate.getTime())) {
        console.log('❌ Invalid endAt date');
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: [{ field: 'endAt', message: 'Invalid end date format' }]
        });
      }
      dataToValidate.endAt = endDate;
    }
    
    // Convert capacity to number
    if (dataToValidate.capacity) {
      console.log('👥 Processing capacity:', dataToValidate.capacity);
      const capacity = parseInt(dataToValidate.capacity);
      if (isNaN(capacity) || capacity < 1) {
        console.log('❌ Invalid capacity');
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: [{ field: 'capacity', message: 'Capacity must be a positive number' }]
        });
      }
      dataToValidate.capacity = capacity;
    }
    
    // Handle tags array - could be string or array
    if (dataToValidate.tags) {
      console.log('🏷️ Processing tags:', dataToValidate.tags);
      if (typeof dataToValidate.tags === 'string') {
        dataToValidate.tags = dataToValidate.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(dataToValidate.tags)) {
        dataToValidate.tags = dataToValidate.tags.filter(tag => tag && tag.trim());
      }
    }
    
    // Debug logging
    console.log('🔧 Data to validate:', JSON.stringify(dataToValidate, null, 2));
    
    const { error } = schema.validate(dataToValidate);
    if (error) {
      console.log('❌ Validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    console.log('✅ Validation passed');
    
    // Update req.body with the processed data
    req.body = dataToValidate;
    
    // Custom validation for start date being in the future
    if (dataToValidate.startAt && dataToValidate.startAt <= new Date()) {
      console.log('❌ Start date is not in the future');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: [{ field: 'startAt', message: 'Start date must be in the future' }]
      });
    }
    
    next();
  };
};

// User validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  password: Joi.string().min(6).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Event validation schemas
export const eventSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(5000).required(),
  category: Joi.string().valid(
    'workshop', 'concert', 'sports', 'hackathon', 
    'conference', 'seminar', 'exhibition', 'festival', 'other'
  ).required(),
  venue: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().default('India'),
    lat: Joi.number().optional(),
    lng: Joi.number().optional(),
    type: Joi.string().valid('indoor', 'outdoor').default('indoor')
  }).required(),
  startAt: Joi.date().required(),
  endAt: Joi.date().greater(Joi.ref('startAt')).required(),
  capacity: Joi.number().integer().min(1).required(),
  tags: Joi.array().items(Joi.string()).optional()
});

// Ticket type validation
export const ticketTypeSchema = Joi.object({
  name: Joi.string().valid('General', 'VIP', 'Student', 'EarlyBird').required(),
  description: Joi.string().optional(),
  price: Joi.number().min(0).required(),
  saleStartAt: Joi.date().required(),
  saleEndAt: Joi.date().greater(Joi.ref('saleStartAt')).required(),
  maxQuantity: Joi.number().integer().min(1).required(),
  perUserLimit: Joi.number().integer().min(1).default(5)
});

// Booking validation
export const createOrderSchema = Joi.object({
  eventId: Joi.string().required(),
  items: Joi.array().items(Joi.object({
    ticketTypeId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required()
  })).min(1).required(),
  attendeeInfo: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).required()
  }).required(),
  couponCode: Joi.string().optional()
});

// Coupon validation
export const couponSchema = Joi.object({
  code: Joi.string().min(3).max(20).pattern(/^[A-Z0-9]+$/).required(),
  type: Joi.string().valid('PERCENT', 'FIXED', 'BOGO', 'GROUP').required(),
  value: Joi.number().min(0).required(),
  minAmount: Joi.number().min(0).default(0),
  maxDiscount: Joi.number().min(0).optional(),
  validFrom: Joi.date().required(),
  validTo: Joi.date().greater(Joi.ref('validFrom')).required(),
  usageLimitGlobal: Joi.number().integer().min(1).optional(),
  usagePerUser: Joi.number().integer().min(1).default(1),
  applicableEventIds: Joi.array().items(Joi.string()).optional()
});

export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
export const validateEvent = validate(eventSchema);
export const validateTicketType = validate(ticketTypeSchema);
export const validateCreateOrder = validate(createOrderSchema);
export const validateCoupon = validate(couponSchema);