const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock user database for demonstration (would be replaced with Supabase in production)
const users = [];

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, fullName, state } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email, password, and full name' 
      });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      fullName,
      state: state || 'North Carolina',
      profileImageUrl: null,
      createdAt: new Date().toISOString()
    };

    // Add to "database"
    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      'your_jwt_secret', // Would use process.env.JWT_SECRET in production
      { expiresIn: '1d' }
    );

    // Return success
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          state: newUser.state
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      'your_jwt_secret', // Would use process.env.JWT_SECRET in production
      { expiresIn: '1d' }
    );

    // Return success
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          state: user.state
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/auth/verify/:token
 * @desc    Verify email with token
 * @access  Public
 */
router.get('/verify/:token', (req, res, next) => {
  try {
    const { token } = req.params;
    
    // In a real app, this would verify the token against a stored email verification token
    // For this demo, we'll just return success
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 