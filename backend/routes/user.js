const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Reference to the mock users array (would be replaced with Supabase in production)
// Note: This is a reference to the same array in auth.js, but in a real app
// we would import from a database module instead
const users = [];

/**
 * @route   GET /api/v1/user/profile
 * @desc    Get user profile information
 * @access  Private
 */
router.get('/profile', async (req, res, next) => {
  try {
    const userId = req.query.userId; // In production, would get from JWT
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Find user by ID
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove sensitive information
    const { password, ...userProfile } = user;
    
    res.status(200).json({
      success: true,
      data: {
        user: userProfile
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/user/profile
 * @desc    Update user profile information
 * @access  Private
 */
router.put('/profile', async (req, res, next) => {
  try {
    const userId = req.query.userId; // In production, would get from JWT
    const { fullName, state, profileImageUrl } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Find user by ID
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user fields
    if (fullName) users[userIndex].fullName = fullName;
    if (state) users[userIndex].state = state;
    if (profileImageUrl) users[userIndex].profileImageUrl = profileImageUrl;
    
    // Remove sensitive information
    const { password, ...updatedUser } = users[userIndex];
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/user/password
 * @desc    Update user password
 * @access  Private
 */
router.put('/password', async (req, res, next) => {
  try {
    const userId = req.query.userId; // In production, would get from JWT
    const { currentPassword, newPassword } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    // Find user by ID
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, users[userIndex].password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    users[userIndex].password = hashedPassword;
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 