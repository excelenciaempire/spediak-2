const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const logger = require('../config/logger');
const { signupValidation, loginValidation } = require('../middleware/validation');
require('dotenv').config();

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', signupValidation, async (req, res, next) => {
  try {
    const { email, password, fullName, state } = req.body;

    logger.info(`Attempting to register user with email: ${email}`);

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      logger.error(`Registration error: ${authError.message}`);
      return res.status(400).json({ 
        success: false, 
        message: authError.message
      });
    }

    // Store additional user data in Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          full_name: fullName,
          state: state || 'North Carolina',
          profile_image_url: null,
          created_at: new Date().toISOString()
        }
      ]);

    if (userError) {
      logger.error(`User data error: ${userError.message}`);
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create user profile' 
      });
    }

    logger.info(`User registered successfully: ${email}`);

    // Return success
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName,
          state: state || 'North Carolina'
        }
      }
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', loginValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    logger.info(`Login attempt for user: ${email}`);

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      logger.warn(`Login failed for user ${email}: ${authError.message}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Get user profile data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      logger.error(`Error fetching user data: ${userError.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Error retrieving user profile' 
      });
    }

    logger.info(`User login successful: ${email}`);

    // Return success
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName: userData.full_name,
          state: userData.state,
          profileImageUrl: userData.profile_image_url
        }
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
});

/**
 * @route   GET /api/v1/auth/verify/:token
 * @desc    Verify email with token
 * @access  Public
 */
router.get('/verify/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    
    logger.info('Email verification attempt');

    // In a real app, this would verify the token against a stored email verification token
    // With Supabase, email verification is handled automatically by Supabase Auth
    
    res.status(200).json({
      success: true,
      message: 'Email verification handled by Supabase Auth'
    });
  } catch (error) {
    logger.error(`Verification error: ${error.message}`);
    next(error);
  }
});

module.exports = router; 