const express = require('express');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/authMiddleware');
const { globalLimiter, authLimiter, securityHeaders, corsConfig } = require('./middleware/security');
const logger = require('./config/logger');
const supabase = require('./config/supabase');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/auth');
const inspectionRoutes = require('./routes/inspections');
const userRoutes = require('./routes/user');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Test Supabase connection
supabase.auth.getSession().then(() => {
  logger.info('Supabase connection successful');
}).catch(error => {
  logger.error(`Supabase connection error: ${error.message}`);
  process.exit(1);
});

// Middleware
app.use(securityHeaders); // Security headers via Helmet
app.use(corsConfig); // CORS for cross-origin requests
app.use(globalLimiter); // Rate limiting
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Log incoming requests in development environment
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/inspections', authMiddleware, inspectionRoutes);
app.use('/api/v1/user', authMiddleware, userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler for unknown routes
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Not Found',
    message: `The requested resource at ${req.originalUrl} was not found` 
  });
});

// Global error handler
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

module.exports = app; // Export for testing 