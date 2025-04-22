const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const supabase = require('../config/supabaseClient'); // Use backend client
const { inspectionValidation } = require('../middleware/validation'); // Import validation
const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI client (structure added previously, assuming it exists)
let openai;
try {
  if (!process.env.OPENAI_API_KEY) {
    logger.warn('OPENAI_API_KEY environment variable not set. DDID generation will be mocked.');
  } else {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    logger.info('OpenAI client initialized successfully.');
  }
} catch (error) {
  logger.error('Failed to initialize OpenAI client:', error);
}

/**
 * @route   POST /api/v1/inspections/generate-ddid
 * @desc    Generate a DDID response from an image and description using OpenAI
 * @access  Private
 */
router.post('/generate-ddid', async (req, res, next) => {
  try {
    const { imageUrl, description, state } = req.body; // Expecting a public URL for imageUrl
    const userId = req.user.id;

    logger.info(`DDID generation requested by user ${userId} for state ${state || 'default'}`);

    if (!imageUrl || !description) {
      return res.status(400).json({ success: false, message: 'Image URL and description required' });
    }
    
    // TODO MVP+: Validate if imageUrl is a valid URL before sending to OpenAI.
    const imageReferenceForOpenAI = imageUrl;

    if (!openai) {
      // ... (mock response fallback)
      logger.warn('OpenAI client not initialized. Returning mock DDID response.');
      const mockResponse = generateMockDDID(description, state || 'North Carolina');
      return res.status(200).json({
        success: true,
        message: 'DDID generated (mock response - OpenAI not configured)',
        data: { ddidResponse: mockResponse }
      });
    }

    try {
      logger.info('Sending request to OpenAI Vision API...');
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                // Refined Prompt: Ask for a structured response
                text: `Analyze the provided image and description for a property inspection conducted in the state of ${state || 'General'}. \nDescription: "${description}". \nBased ONLY on the visual evidence and description, provide a concise Defect, Deficiency, and Improvement Determination (DDID) statement. \nThe statement should clearly identify the potential issue, its implications (e.g., safety, structural), and a general recommendation (e.g., evaluation by a licensed professional). \nFormat the response clearly as a DDID statement.`
              },
              {
                type: "image_url",
                image_url: {
                  "url": imageReferenceForOpenAI,
                  // "detail": "low" // Optional: use low detail for faster/cheaper response if full res not needed
                },
              },
            ],
          },
        ],
        max_tokens: 350, // Increased slightly for potentially more detailed response
      });
      logger.info('Received response from OpenAI Vision API.');

      // --- Response Parsing --- 
      // TODO: Implement robust parsing. The response content might include explanations or formatting.
      // You need to extract *only* the intended DDID statement.
      // Example (simple extraction, likely needs improvement):
      let ddidResponse = response.choices[0]?.message?.content || 'Error: Could not generate DDID response.';
      ddidResponse = ddidResponse.replace(/^DDID Statement:\s*/i, '').trim(); // Attempt to remove potential prefix
      // Consider further parsing based on expected structure or keywords.

      // TODO: Add state-specific formatting logic here if the DDID structure varies significantly between NC and SC.

      res.status(200).json({ success: true, message: 'DDID generated successfully', data: { ddidResponse } });

    } catch (openAiError) {
      logger.error('OpenAI API Error:', openAiError);
      // TODO: Add more specific OpenAI error handling (e.g., check openAiError.code for rate limits, invalid image, etc.)
      const errorDetails = openAiError.message || 'Failed to communicate with OpenAI';
      return res.status(500).json({ success: false, message: `OpenAI Error: ${errorDetails}` });
    }
  } catch (error) {
    logger.error('Error in /generate-ddid endpoint:', error);
    next(error);
  }
});

/**
 * @route   POST /api/v1/inspections
 * @desc    Save a new inspection (Using Supabase)
 * @access  Private
 */
// Apply validation middleware
router.post('/', inspectionValidation, async (req, res, next) => { 
  try {
    const userId = req.user.id; // From authMiddleware
    const { imageUrl, description, ddidResponse } = req.body;
    
    logger.info(`Saving inspection for user ${userId}`);

    // TODO MVP+: Handle image persistence properly. Saving URI for now.
    const imageToSave = imageUrl; 

    const { data, error } = await supabase
      .from('inspections')
      .insert({
        user_id: userId,
        image_url: imageToSave,
        description: description,
        ddid_response: ddidResponse,
        // created_at is handled by Supabase default
      })
      .select()
      .single();

    if (error) {
      logger.error('Supabase insert error:', error);
      // Provide more specific error message if possible
      return res.status(500).json({ success: false, message: error.message || 'Failed to save inspection to database' });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Inspection saved successfully', 
      data: { inspection: data } 
    });

  } catch (error) {
    logger.error('Error saving inspection:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/inspections
 * @desc    Get all inspections for a user (Using Supabase)
 * @access  Private
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id; // From authMiddleware
    logger.info(`Fetching inspections for user ${userId}`);

    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Supabase select error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to fetch inspections' });
    }

    res.status(200).json({ 
      success: true, 
      count: data.length, 
      data: { inspections: data } 
    });

  } catch (error) {
    logger.error('Error fetching inspections:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/inspections/:id
 * @desc    Get a specific inspection (Using Supabase)
 * @access  Private
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // From authMiddleware
    logger.info(`Fetching inspection ${id} for user ${userId}`);

    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      // Handle case where inspection is not found vs. other errors
      if (error.code === 'PGRST116') { // PostgREST code for 'Not found'
        logger.warn(`Inspection ${id} not found for user ${userId}`);
        return res.status(404).json({ success: false, message: 'Inspection not found' });
      } else {
        logger.error('Supabase select single error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch inspection' });
      }
    }

    if (!data) {
        logger.warn(`Inspection ${id} not found for user ${userId} (no data)`);
        return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    res.status(200).json({ success: true, data: { inspection: data } });

  } catch (error) {
    logger.error(`Error fetching inspection ${req.params.id}:`, error);
    next(error);
  }
});

// Mock DDID function (fallback if OpenAI fails/not configured)
function generateMockDDID(description, state) {
  const template = `DDID Statement (Mock): The inspector observed ${description.toLowerCase()}. Recommended action based on ${state} codes.`;
  return template;
}

module.exports = router;