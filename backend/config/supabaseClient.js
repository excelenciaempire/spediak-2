const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
// Use the SERVICE_ROLE_KEY for backend operations that need to bypass RLS (e.g., admin tasks)
// Or use ANON_KEY if RLS is set up for direct table access based on user JWT
// Using ANON_KEY for now, assuming RLS is configured appropriately for user actions
const supabaseKey = process.env.SUPABASE_ANON_KEY; 

if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) for backend client');
  // Optionally throw an error or exit
}

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  logger.info('Backend Supabase client initialized.');
} catch (error) {
  logger.error('Failed to initialize backend Supabase client:', error);
  // Handle error appropriately
}

module.exports = supabase; 