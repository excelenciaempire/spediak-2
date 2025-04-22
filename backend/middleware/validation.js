const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(`Validation error: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array(),
    });
  }
  next();
};

// Validation rules for user registration
const signupValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 3 })
    .withMessage('Full name must be at least 3 characters long'),
  body('state')
    .notEmpty()
    .withMessage('State is required'),
  validate,
];

// Validation rules for user login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

// Validation rules for profile update
const profileUpdateValidation = [
  body('fullName')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Full name must be at least 3 characters long'),
  body('state')
    .optional()
    .notEmpty()
    .withMessage('State cannot be empty if provided'),
  validate,
];

// Validation rules for password update
const passwordUpdateValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number'),
  validate,
];

// Validation rules for inspection creation
const inspectionValidation = [
  body('imageUrl')
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Invalid image URL format'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description should be at least 10 characters long'),
  body('ddidResponse')
    .notEmpty()
    .withMessage('DDID response is required'),
  validate,
];

module.exports = {
  signupValidation,
  loginValidation,
  profileUpdateValidation,
  passwordUpdateValidation,
  inspectionValidation,
}; 