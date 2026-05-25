const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendPasswordResetEmail } = require('../services/emailService');

// ────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'donor',
    });

    // Generate JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Login user with email & password
// @route   POST /api/auth/login
// @access  Public
// ────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { email, password } = req.body;

    // Find user and explicitly include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // If user signed up via Google and has no password
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Google sign-in. Please log in with Google.',
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private
// ────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Forgot password — send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
// ────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((e) => e.msg),
      });
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email',
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Build reset URL pointing to the frontend
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);

      res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email',
      });
    } catch (emailError) {
      // If email fails, clear the reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email send error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
// ────────────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((e) => e.msg),
      });
    }

    // Hash the token from the URL to match the one stored in DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with valid (non-expired) token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Auto-login after password reset
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Google OAuth callback handler
// @route   GET /api/auth/google/callback
// @access  Public
// ────────────────────────────────────────────────────────
exports.googleCallback = async (req, res, next) => {
  try {
    // Passport attaches the user to req.user after successful OAuth
    const token = generateToken(req.user._id);

    // Redirect to frontend with token as query parameter
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Update current logged-in user profile
// @route   PUT /api/auth/update-profile
// @access  Private
// ────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { name, email, password } = req.body;

    // Validate Name
    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({ success: false, message: 'Name cannot be empty' });
      }
      if (trimmedName.length < 3 || trimmedName.length > 50) {
        return res.status(400).json({ success: false, message: 'Name must be between 3 and 50 characters' });
      }
      if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
        return res.status(400).json({ success: false, message: 'Name must only contain English letters' });
      }
      user.name = trimmedName;
    }

    // Validate Email
    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) {
        return res.status(400).json({ success: false, message: 'Email cannot be empty' });
      }
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      }

      // Check allowed domains
      const { ALLOWED_EMAIL_DOMAINS } = require('../utils/validators');
      const domain = trimmedEmail.split('@')[1];
      if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
        return res.status(400).json({
          success: false,
          message: 'Only Gmail, Hotmail, Yahoo, or SZABIST email addresses are allowed',
        });
      }

      // Check if email already exists for another user
      if (trimmedEmail !== user.email) {
        const existingUser = await User.findOne({ email: trimmedEmail });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'A user with this email already exists',
          });
        }
        user.email = trimmedEmail;
      }
    }

    // Validate Password
    if (password !== undefined && password !== '') {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
      }
      if (!/\d/.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must contain at least one number',
        });
      }
      user.password = password;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Logout (client-side token removal; here for completeness)
// @route   POST /api/auth/logout
// @access  Private
// ────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
