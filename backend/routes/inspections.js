const express = require('express');
const router = express.Router();

// Mock inspections database for demonstration
const inspections = [];

/**
 * @route   POST /api/v1/inspections/generate-ddid
 * @desc    Generate a DDID response from an image and description
 * @access  Private
 */
router.post('/generate-ddid', async (req, res, next) => {
  try {
    const { imageUrl, description, state } = req.body;
    
    // Validation
    if (!imageUrl || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both image URL and description'
      });
    }
    
    // Simulate image analysis and AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock DDID response based on the state
    // In a real implementation, this would call the OpenAI Vision API
    const stateName = state || 'North Carolina';
    const ddidResponse = generateMockDDID(description, stateName);
    
    res.status(200).json({
      success: true,
      message: 'DDID generated successfully',
      data: {
        ddidResponse
      }
    });
  } catch (error) {
    // Check if it's an image processing error
    if (error.message && error.message.includes('image')) {
      error.isOpenAIError = true;
      error.code = 'image_not_processable';
    }
    next(error);
  }
});

/**
 * @route   POST /api/v1/inspections
 * @desc    Save a new inspection after DDID generation
 * @access  Private
 */
router.post('/', async (req, res, next) => {
  try {
    const { userId, imageUrl, description, ddidResponse } = req.body;
    
    // Validation
    if (!userId || !imageUrl || !description || !ddidResponse) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Create new inspection
    const newInspection = {
      id: Date.now().toString(),
      userId,
      imageUrl,
      description,
      ddidResponse,
      createdAt: new Date().toISOString()
    };
    
    // Add to "database"
    inspections.push(newInspection);
    
    res.status(201).json({
      success: true,
      message: 'Inspection saved successfully',
      data: {
        inspection: newInspection
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/inspections
 * @desc    Get all inspections for a user
 * @access  Private
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.query.userId; // In production, would get from JWT
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Filter inspections by user ID
    const userInspections = inspections.filter(i => i.userId === userId);
    
    // Sort by createdAt in descending order (newest first)
    userInspections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.status(200).json({
      success: true,
      count: userInspections.length,
      data: {
        inspections: userInspections
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/inspections/:id
 * @desc    Get a specific inspection
 * @access  Private
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId; // In production, would get from JWT
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Find inspection by ID
    const inspection = inspections.find(i => i.id === id && i.userId === userId);
    
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        inspection
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Generate a mock DDID response based on the description and state
 * This would be replaced by the actual OpenAI API call in production
 */
function generateMockDDID(description, state) {
  // Basic template for a DDID response
  const template = `DDID Statement: The inspector observed ${description.toLowerCase()}. This is a defect because it could lead to structural issues, safety hazards, or decreased property value if not addressed.

The inspector recommends having a licensed professional evaluate the issue and make necessary repairs according to ${state} building codes and standards.`;
  
  return template;
}

module.exports = router; 