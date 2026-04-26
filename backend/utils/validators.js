const { body } = require('express-validator');

// Allowed email domains
const ALLOWED_EMAIL_DOMAINS = ['gmail.com', 'hotmail.com', 'yahoo.com', 'szabist-isb.pk'];

/**
 * Custom email domain validator
 */
const isAllowedEmailDomain = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must only contain English letters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .custom((email) => {
      if (!isAllowedEmailDomain(email)) {
        throw new Error('Only Gmail, Hotmail, Yahoo, or SZABIST email addresses are allowed');
      }
      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 3 })
    .withMessage('Password must be at least 3 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('role')
    .optional()
    .isIn(['ngo', 'donor'])
    .withMessage('Role must be ngo or donor'),
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Validation rules for forgot password
 */
const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
];

/**
 * Validation rules for reset password
 */
const resetPasswordValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 3 })
    .withMessage('Password must be at least 3 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  ALLOWED_EMAIL_DOMAINS,
};
