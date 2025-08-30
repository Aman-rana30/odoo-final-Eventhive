const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
exports.validateRegister = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2-50 characters'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2-50 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('role')
    .optional()
    .isIn(['attendee', 'organizer'])
    .withMessage('Role must be either attendee or organizer')
];

exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Event validation rules
exports.validateEvent = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Event title must be between 5-100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Event description is required')
    .isLength({ min: 50, max: 5000 })
    .withMessage('Event description must be between 50-5000 characters'),

  body('category')
    .isIn(['music', 'sports', 'technology', 'business', 'education', 'entertainment', 'workshop', 'hackathon', 'conference', 'other'])
    .withMessage('Please select a valid category'),

  body('startDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid start date'),

  body('endDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid end date'),

  body('venue.name')
    .trim()
    .notEmpty()
    .withMessage('Venue name is required'),

  body('venue.address')
    .trim()
    .notEmpty()
    .withMessage('Venue address is required'),

  body('ticketTypes')
    .isArray({ min: 1 })
    .withMessage('At least one ticket type is required'),

  body('ticketTypes.*.name')
    .trim()
    .notEmpty()
    .withMessage('Ticket type name is required'),

  body('ticketTypes.*.price')
    .isNumeric({ min: 0 })
    .withMessage('Ticket price must be a valid number'),

  body('ticketTypes.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Ticket quantity must be at least 1')
];

// Order validation rules
exports.validateOrder = [
  body('eventId')
    .isMongoId()
    .withMessage('Valid event ID is required'),

  body('tickets')
    .isArray({ min: 1 })
    .withMessage('At least one ticket must be selected'),

  body('tickets.*.ticketType')
    .trim()
    .notEmpty()
    .withMessage('Ticket type is required'),

  body('tickets.*.quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Ticket quantity must be between 1-10'),

  body('contactInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid contact email is required'),

  body('contactInfo.phone')
    .isMobilePhone('en-IN')
    .withMessage('Valid contact phone is required')
];

// Review validation rules
exports.validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1-5'),

  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Review comment must be between 10-500 characters'),

  param('eventId')
    .isMongoId()
    .withMessage('Valid event ID is required')
];
