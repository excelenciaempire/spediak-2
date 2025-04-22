const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');
const logger = require('../config/logger');
const { profileUpdateValidation, passwordUpdateValidation } = require('../middleware/validation');

/**
 * @route   GET /api/v1/user/profile
 * @desc    Get user profile information
 * @access  Private
 */
router.get('/profile', async (req, res, next) => {
  try {
    const userId = req.user.id; // Get the user ID from the token
    
    logger.info(`Fetching profile for user: ${userId}`);
    
    // Get user from Supabase
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      logger.error(`Error fetching user: ${error.message}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Format response data
    const userProfile = {
      id: userData.id,
      email: userData.email,
      fullName: userData.full_name,
      state: userData.state,
      profileImageUrl: userData.profile_image_url,
      createdAt: userData.created_at
    };
    
    res.status(200).json({
      success: true,
      data: {
        user: userProfile
      }
    });
  } catch (error) {
    logger.error(`Profile fetch error: ${error.message}`);
    next(error);
  }
});

/**
 * @route   PUT /api/v1/user/profile
 * @desc    Update user profile information
 * @access  Private
 */
router.put('/profile', profileUpdateValidation, async (req, res, next) => {
  try {
    const userId = req.user.id; // Get the user ID from the token
    const { fullName, state, profileImageUrl } = req.body;
    
    logger.info(`Updating profile for user: ${userId}`);
    
    // Prepare update data (converting camelCase to snake_case for database)
    const updateData = {};
    if (fullName) updateData.full_name = fullName;
    if (state) updateData.state = state;
    if (profileImageUrl !== undefined) updateData.profile_image_url = profileImageUrl;
    
    // Update user in Supabase
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      logger.error(`Profile update error: ${error.message}`);
      return res.status(404).json({
        success: false,
        message: 'User not found or update failed'
      });
    }
    
    // Format response data
    const userProfile = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.full_name,
      state: updatedUser.state,
      profileImageUrl: updatedUser.profile_image_url,
      createdAt: updatedUser.created_at
    };
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userProfile
      }
    });
  } catch (error) {
    logger.error(`Profile update error: ${error.message}`);
    next(error);
  }
});

/**
 * @route   PUT /api/v1/user/password
 * @desc    Update user password
 * @access  Private
 */
router.put('/password', passwordUpdateValidation, async (req, res, next) => {
  try {
    const userId = req.user.id; // Get the user ID from the token
    const { currentPassword, newPassword } = req.body;
    
    logger.info(`Password update attempt for user: ${userId}`);
    
    // Using Supabase Auth API to update password
    // First, get user's current email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (userError) {
      logger.error(`Error fetching user email: ${userError.message}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password by attempting sign-in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: currentPassword
    });
    
    if (signInError) {
      logger.warn(`Invalid current password for user: ${userId}`);
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (updateError) {
      logger.error(`Password update error: ${updateError.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }
    
    logger.info(`Password updated successfully for user: ${userId}`);
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error(`Password update error: ${error.message}`);
    next(error);
  }
});

module.exports = router; 