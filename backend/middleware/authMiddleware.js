const supabase = require('../config/supabase');
const logger = require('../config/logger');

/**
 * Authentication middleware using Supabase
 * Verifies the JWT token from the Authorization header
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header');
      return res.status(401).json({ 
        success: false, 
        message: 'Authorization token is required' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      logger.warn(`Invalid token: ${error?.message || 'User not found'}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    // Attach the user to the request object
    req.user = data.user;
    logger.info(`Authenticated user: ${data.user.email}`);
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

module.exports = authMiddleware; 