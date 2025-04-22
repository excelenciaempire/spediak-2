import Constants from 'expo-constants';
import { supabase } from './supabaseClient'; // Import the Supabase client
import { AuthError, PostgrestError, Session, User as SupabaseAuthUser } from '@supabase/supabase-js';

// Define API base URL (only needed for non-Supabase endpoints like generateDDID)
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api/v1';

// Keep existing types, but they might need adjustment based on Supabase schema
// Or use Supabase generated types in the future
export interface User {
  id: string;
  email?: string; // Email might be from auth user, not users table directly sometimes
  full_name: string; // Supabase uses snake_case by default, ensure table matches or map
  state: string;
  profile_image_url: string | null;
  created_at: string;
  updated_at?: string; // Added optional updated_at
}

export interface Inspection {
  id: string;
  user_id: string; // Ensure this matches Supabase column name
  image_url: string;
  description: string;
  ddid_response: string;
  created_at: string;
  updated_at?: string; // Added optional updated_at
}

// --- Helper for handling Supabase errors ---
const handleSupabaseError = (error: AuthError | PostgrestError | null, context: string): never => {
  console.error(`Supabase Error (${context}):`, error?.message);
  throw new Error(error?.message || `An error occurred during ${context}.`);
};

// --- Authentication API calls using Supabase ---
export const authApi = {
  // Register a new user
  async register(email: string, password: string, fullName: string, state: string) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Store additional user metadata upon sign-up
        // This data is stored in auth.users.raw_user_meta_data
        // The handle_new_user trigger should ideally pull from here or be updated
        data: {
          full_name: fullName, // Ensure your handle_new_user trigger uses this
          state: state,        // Ensure your handle_new_user trigger uses this
        }
      }
    });

    if (signUpError) {
      return handleSupabaseError(signUpError, 'registration');
    }
    if (!signUpData.user) {
        throw new Error('Registration successful, but no user data returned.');
    }

    // Note: The handle_new_user trigger you created should automatically
    // insert into the public.users table. If it doesn't have access
    // to full_name and state from options.data, you might need to:
    // 1. Update the trigger to read from raw_user_meta_data OR
    // 2. Make a separate call here to insert/update the public.users table
    //    (less ideal as it's not atomic with signup).

    // Example of updating public.users if trigger doesn't handle metadata:
    // const { error: profileError } = await supabase
    //   .from('users')
    //   .update({ full_name: fullName, state: state })
    //   .eq('id', signUpData.user.id);
    // if (profileError) {
    //    console.warn("User signed up, but failed to update profile details immediately.", profileError);
    //    // Decide how to handle this - maybe retry later?
    // }


    // Return structure can be simplified or adapted as needed by your AuthContext
    return {
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      data: {
        user: signUpData.user, // Contains auth user info (id, email, etc.)
        session: signUpData.session // Contains access token etc.
      }
    };
  },

  // Login an existing user
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return handleSupabaseError(error, 'login');
    }
     if (!data.user || !data.session) {
        throw new Error('Login successful, but no user or session data returned.');
    }

    // Optionally fetch the full user profile from public.users table here
    // const profile = await userApi.getProfile(data.user.id);

    return {
       success: true,
       message: 'Login successful.',
       data: {
         user: data.user,    // Auth user
         session: data.session // Session details (token)
         // profile: profile.data?.user // Include profile if fetched
       }
     };
  },

  // Log out user
  async logout(): Promise<{ success: boolean, message?: string }> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      // Don't throw, just log and report failure
       console.error('Supabase Error (logout):', error?.message);
      return { success: false, message: error.message };
    }
    // Note: Clearing local storage might still be desired depending on what else is stored
    // Consider calling storageService.clearAllUserData(userId) if needed,
    // but ensure userId is available before calling signOut.
    return { success: true };
  },
};

// --- Inspection API calls using Supabase ---
export const inspectionApi = {
  // Generate DDID - Assuming this still calls your custom endpoint
  async generateDDID(
    imageUrl: string,
    description: string,
    userId: string // This might not be needed if auth is handled by the endpoint
  ): Promise<{ success: boolean; message?: string; data?: { ddidResponse: string }}> {
     console.warn("generateDDID is using the old fetch method. Ensure API_URL is correct and the endpoint handles auth if needed.");
    try {
      // Get the current session for the auth token
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        throw new Error('User not authenticated. Cannot generate DDID.');
      }

      const response = await fetch(`${API_URL}/inspections/generate-ddid`, {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
           // Pass the Supabase JWT token to your custom backend
           'Authorization': `Bearer ${session.access_token}`
        },
        // Check if your backend endpoint still needs userId in the body
        body: JSON.stringify({ imageUrl, description, userId }),
      });

       if (!response.ok) {
         const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
         throw new Error(errorData.message || `HTTP error ${response.status}`);
       }

      return await response.json();
    } catch (error: any) {
       console.error('API Error (generateDDID):', error);
       throw new Error(error.message || 'Failed to generate DDID response.');
    }
  },

  // Save a new inspection
  async saveInspection(
    userId: string,
    imageUrl: string,
    description: string,
    ddidResponse: string
  ): Promise<{ success: boolean; message?: string; data?: { inspection: Inspection }}> {
     const { data, error } = await supabase
       .from('inspections')
       .insert({
         user_id: userId, // Ensure column name matches
         image_url: imageUrl,
         description: description,
         ddid_response: ddidResponse,
       })
       .select() // Return the created record
       .single(); // Expecting a single record back

    if (error) {
      handleSupabaseError(error, 'save inspection');
    }

    return {
      success: true,
      message: 'Inspection saved successfully.',
      data: { inspection: data as Inspection } // Cast needed if types don't perfectly align
    };
  },

  // Get all inspections for a user
  async getInspections(userId: string): Promise<{ success: boolean; message?: string; data?: { inspections: Inspection[] } }> {
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('user_id', userId) // Filter by user_id
      .order('created_at', { ascending: false }); // Order by creation date

    if (error) {
      handleSupabaseError(error, 'get inspections');
    }

    return {
      success: true,
      data: { inspections: data as Inspection[] }
    };
  },

  // Get a specific inspection
  async getInspection(id: string): Promise<{ success: boolean; message?: string; data?: { inspection: Inspection } }> {
     const { data, error } = await supabase
       .from('inspections')
       .select('*')
       .eq('id', id)
       .single(); // Expecting one result

    if (error) {
      handleSupabaseError(error, 'get single inspection');
    }
     if (!data) {
        return { success: false, message: 'Inspection not found.' };
     }

    return {
      success: true,
      data: { inspection: data as Inspection }
    };
  },

  // NOTE: syncOfflineQueue is removed as Supabase client doesn't handle this.
};

// --- User API calls using Supabase ---
export const userApi = {
  // Get user profile from public.users table
  async getProfile(userId: string): Promise<{ success: boolean; message?: string; data?: { user: User } }> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // It's common for a profile to not exist immediately after signup
      // depending on trigger timing. Handle 'No rows found' gracefully.
      if (error.code === 'PGRST116') { // PostgREST code for 'exact one row expected, 0 rows found'
         return { success: false, message: 'User profile not found.' };
      }
      handleSupabaseError(error, 'get profile');
    }
     if (!data) {
        return { success: false, message: 'User profile not found.' };
     }

    // Map Supabase snake_case to camelCase if needed by the interface
    const userProfile: User = {
      id: data.id,
      email: data.email, // Assuming email is also in your users table
      full_name: data.full_name,
      state: data.state,
      profile_image_url: data.profile_image_url,
      created_at: data.created_at,
      updated_at: data.updated_at
    };


    return { success: true, data: { user: userProfile } };
  },

  // Update user profile in public.users table
  async updateProfile(
    userId: string,
    // Use snake_case matching Supabase columns
    updateData: { full_name?: string; state?: string; profile_image_url?: string | null }
  ): Promise<{ success: boolean; message?: string; data?: { user: User } }> {

    // Remove undefined fields to avoid overwriting existing values with null
    const validUpdateData = Object.entries(updateData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            // Cast key to keyof typeof updateData if necessary, or keep accumulator general
            (acc as any)[key] = value;
        }
        return acc;
    // Start with an empty object type that allows string keys
    }, {} as { [key: string]: any });


    if (Object.keys(validUpdateData).length === 0) {
       return { success: true, message: "No changes provided." };
    }


    const { data, error } = await supabase
      .from('users')
      .update(validUpdateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'update profile');
    }

    // Map response back if necessary
     const updatedProfile: User = {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      state: data.state,
      profile_image_url: data.profile_image_url,
      created_at: data.created_at,
      updated_at: data.updated_at
    };


    return { success: true, message: 'Profile updated successfully.', data: { user: updatedProfile } };
  },

  // Moved updatePassword here from authApi
  async updatePassword(
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    const { error } = await supabase.auth.updateUser({
       password: newPassword
    });

    if (error) {
      // Handle potential errors like "New password should be different from the old password."
      handleSupabaseError(error, 'update password');
    }

    return { success: true, message: 'Password updated successfully.' };
  },
};

// Removed: API_URL constant (except where needed), handleApiError, getHeaders, isOnline
// Removed: storageService dependency (for offline queue)
// Removed: NetInfo dependency
// Removed: verifyEmail function
// Removed: syncOfflineQueue function
// Note: Ensure Constants.expoConfig.extra.apiUrl is still configured if needed for generateDDID

// Removed: handleApiError, getHeaders, isOnline, verifyEmail, syncOfflineQueue
// Note: Ensure Constants.expoConfig.extra.apiUrl is still configured if needed for generateDDID 