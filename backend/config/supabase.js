const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://spgdhrzzotkonjyikcgl.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ2Rocnp6b3Rrb25qeWlrY2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODg3MDMsImV4cCI6MjA2MDc2NDcwM30.EQF06xqAKzuoTFhIUT8LKSO125kpRs29YcD2UcW69ng';

if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase environment variables');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
});

logger.info('Supabase client initialized');

module.exports = supabase; 