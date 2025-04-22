import 'react-native-url-polyfill/auto'; // Required for Supabase to work in React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// TODO: Move these to a secure configuration method (e.g., Expo Secrets, .env)
const supabaseUrl = 'https://spgdhrzzotkonjyikcgl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ2Rocnp6b3Rrb25qeWlrY2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODg3MDMsImV4cCI6MjA2MDc2NDcwM30.EQF06xqAKzuoTFhIUT8LKSO125kpRs29YcD2UcW69ng';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your configuration.');
  // Optionally throw an error or handle appropriately
}

// Define a server-safe "no-op" storage adapter
const noOpStorage = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {},
  removeItem: (_key: string) => {},
};

// Conditionally choose storage based on environment
const storageAdapter = typeof window !== 'undefined' ? AsyncStorage : noOpStorage;

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: storageAdapter, // Use the conditional storage adapter
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable URL session detection for React Native
  },
}); 