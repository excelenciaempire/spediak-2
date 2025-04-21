const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const inspectionRoutes = require('./routes/inspections');
const userRoutes = require('./routes/user');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS for cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/inspections', inspectionRoutes);
app.use('/api/v1/user', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `The requested resource at ${req.originalUrl} was not found` 
  });
});

// Global error handler
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Export for testing 