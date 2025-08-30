import Joi from 'joi';

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
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
  startAt: Joi.date().greater('now').required(),
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