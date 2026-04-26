const express = require('express');
const passport = require('passport');
const router = express.Router();

const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  googleCallback,
  logout,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require('../utils/validators');

// ─── Public Routes ───────────────────────────────────────
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.put('/reset-password/:token', resetPasswordValidation, resetPassword);

// ─── Google OAuth Routes ─────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
    session: false,
  }),
  googleCallback
);

// ─── Protected Routes ────────────────────────────────────
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
