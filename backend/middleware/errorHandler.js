/**
 * Global error handler middleware for the application
 * Handles various types of errors and formats the response consistently
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let error = err.error || 'ServerError';
  
  // Handle different types of errors
  
  // Validation errors (e.g., from express-validator)
  if (err.type === 'ValidationError' || (err.errors && Array.isArray(err.errors))) {
    statusCode = 400;
    message = 'Validation Error';
    error = {
      type: 'ValidationError',
      details: err.errors || err.details || []
    };
  }
  
  // JWT errors (authentication)
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    error = {
      type: 'AuthenticationError',
      details: err.message
    };
  }
  
  // OpenAI API errors
  else if (err.isOpenAIError) {
    statusCode = err.status || 500;
    message = 'AI Processing Error';
    error = {
      type: 'OpenAIError',
      details: err.message,
      code: err.code
    };
    
    // Special handling for image analysis errors
    if (err.code === 'image_not_processable') {
      message = 'Image analysis failed';
      error.details = 'The provided image could not be processed. Please try a different image.';
    }
  }
  
  // Supabase database errors
  else if (err.code && err.code.startsWith('PGRST')) {
    statusCode = 500;
    message = 'Database Error';
    error = {
      type: 'DatabaseError',
      details: err.message
    };
  }
  
  // Return the error response
  res.status(statusCode).json({
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

module.exports = { errorHandler }; 