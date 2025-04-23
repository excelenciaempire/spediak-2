import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, authApi, userApi } from '@/services/api';
import { router } from 'expo-router';
import { supabase } from '@/services/supabaseClient';
import { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Define the auth context type
interface AuthContextType {
  // User profile from public.users table
  user: User | null;
  // Supabase auth user object (can be different from profile)
  authUser: SupabaseAuthUser | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, state: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  // Function to manually refresh user profile if needed
  refreshUserProfile: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  authUser: null,
  session: null,
  isLoading: true,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  clearError: () => {},
  refreshUserProfile: async () => {},
});

// Key for storing the user profile (optional, but can speed up initial load)
const USER_PROFILE_KEY = 'auth_user_profile';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null); // Profile from public.users
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null); // From supabase.auth.user()
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from backend
  const fetchUserProfile = async (authUserId: string) => {
    try {
      const { data, success, message } = await userApi.getProfile(authUserId);
      if (success && data?.user) {
        setUser(data.user);
        // Optionally store profile for faster subsequent loads (ONLY ON NATIVE)
        if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(USER_PROFILE_KEY, JSON.stringify(data.user));
        }
        setError(null); // Clear previous errors on successful fetch
      } else {
         // Profile might not exist yet if trigger hasn't run
         console.warn('fetchUserProfile: Profile not found or fetch failed.', message);
         setUser(null); // Ensure profile state is null if fetch fails
         // Clear potentially stale profile (ONLY ON NATIVE)
         if (Platform.OS !== 'web') {
            await SecureStore.deleteItemAsync(USER_PROFILE_KEY); 
         }
         // Don't set a generic error here, let specific operations handle errors
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      // Don't set a global error here, as it might mask login/signup errors
      // setError(`Failed to load profile: ${err.message}`);
      setUser(null); // Ensure profile state is null on error
      // Clear potentially stale profile (ONLY ON NATIVE)
      if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
      }
    }
  };

  // Handle session loading and auth state changes
  useEffect(() => {
    // Ensure this effect runs only once on the client after initial mount
    // Avoid accessing storage or window object directly here during SSR

    const initializeAuth = async () => {
    setIsLoading(true);
    let profileLoadedFromStorage = false;

      try {
        // Try loading profile from SecureStore first (ONLY ON NATIVE)
        if (Platform.OS !== 'web') {
          const storedProfile = await SecureStore.getItemAsync(USER_PROFILE_KEY);
      if (storedProfile) {
         try {
            const parsedProfile = JSON.parse(storedProfile);
            if (parsedProfile && typeof parsedProfile === 'object' && 'id' in parsedProfile) {
               setUser(parsedProfile);
               profileLoadedFromStorage = true;
               console.log("Loaded user profile from storage.");
            } else {
               console.warn("Invalid user profile found in storage, removing.");
                await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
            }
         } catch (e) {
            console.error("Failed to parse stored user profile, removing.", e);
              await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
         }
      }
        }

        // Now check Supabase session - this part accesses AsyncStorage indirectly
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting initial session:', sessionError);
          // Potentially clear state if session check fails critically?
          // setUser(null); setAuthUser(null); setSession(null);
          // await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
        } else {
      setSession(initialSession);
      const currentAuthUser = initialSession?.user ?? null;
      setAuthUser(currentAuthUser);

      if (currentAuthUser) {
        console.log("Initial session found, fetching/validating profile...");
            await fetchUserProfile(currentAuthUser.id); // Fetch profile if session exists
      } else {
         // No initial session, clear any potentially loaded profile from storage
            if (profileLoadedFromStorage && Platform.OS !== 'web') {
              await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
              console.log("No initial session, cleared profile loaded from storage.");
            }
             // Also clear React state if profile was loaded from storage
         if (profileLoadedFromStorage) {
            setUser(null);
             }
          }
        }
      } catch (err) {
         // Catch any unexpected error during init
         console.error("Unexpected error during auth initialization:", err);
         // Ensure state is cleared on major failure
         setUser(null); setAuthUser(null); setSession(null);
         if (Platform.OS !== 'web') {
           await SecureStore.deleteItemAsync(USER_PROFILE_KEY).catch(e => console.error("Failed to clear storage on init error", e));
         }
      } finally {
        setIsLoading(false);
      }
    };

    // --- Run Initialization only on Client-Side ---
    // Check if we are in a browser environment (client-side)
    // Platform.OS === 'web' might also work, but typeof window is more direct for SSR check
    if (typeof window !== 'undefined') {
       initializeAuth();

       // Setup the listener only on the client
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
           console.log("Auth state change event:", event);
        setSession(newSession);
        const newAuthUser = newSession?.user ?? null;
        setAuthUser(newAuthUser);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (newAuthUser) {
             console.log(`Auth event ${event}, fetching profile...`);
               setIsLoading(true); // Show loading while profile fetches after auth change
             await fetchUserProfile(newAuthUser.id);
               setIsLoading(false);
          } else {
             console.warn(`Auth event ${event} but no auth user found.`);
               setUser(null);
               if (Platform.OS !== 'web') {
             await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
               }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("Auth event SIGNED_OUT, clearing profile.");
          setUser(null);
             if (Platform.OS !== 'web') {
          await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
             }
        }
           // Ensure loading state is updated appropriately after events
           if (isLoading) setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
    } else {
      // On the server, we don't interact with Supabase auth or storage.
      // Set loading to false immediately. The client will take over.
      setIsLoading(false);
      console.log("Auth Provider: Skipping storage interaction on server.");
      return () => {}; // No cleanup needed server-side
    }

  }, []); // <-- IMPORTANT: Empty dependency array ensures this runs only once on client mount

  // --- Auth Actions ---

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // authApi.login handles the supabase.auth.signInWithPassword call
      const result = await authApi.login(email, password);
      // The onAuthStateChange listener will handle setting the session and fetching the profile.
      // We just need to check for errors reported by our wrapper.
      if (!result.success) {
         throw new Error(result.message || 'Login failed');
      }
      console.log("Login API call successful.");
      // No need to manually set user/session here
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
       // Ensure user state is cleared on login failure
       setUser(null);
       setAuthUser(null);
       setSession(null);
       // Clear SecureStore ONLY ON NATIVE
       if (Platform.OS !== 'web') {
       await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
       }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string, state: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // authApi.register handles the supabase.auth.signUp call
      const result = await authApi.register(email, password, fullName, state);
       if (!result.success) {
         throw new Error(result.message || 'Signup failed');
      }
       console.log("Signup API call successful.");
      // Sign up doesn't automatically sign in the user unless email confirmation is disabled.
      // The onAuthStateChange listener will trigger if the user becomes authenticated.
      // Redirect to a verification page or show a message.
      router.replace('/(auth)/verify-email'); // Redirect to verify email suggestion page/component
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // authApi.logout handles the supabase.auth.signOut call
      const result = await authApi.logout();
      if (!result.success) {
         // Log error but don't necessarily block logout locally
         console.error("Logout API error:", result.message);
      }
       console.log("Logout API call successful.");
      // The onAuthStateChange listener handles clearing user/session state and storage.
    } catch (err: any) {
      // Catch errors from the authApi.logout wrapper itself (unlikely)
      console.error('Error during logout process:', err);
      setError(err.message || 'Logout failed');
    } finally {
       // Ensure state is cleared even if API call had issues, listener might take time
       setUser(null);
       setAuthUser(null);
       setSession(null);
       // Clear SecureStore ONLY ON NATIVE
       if (Platform.OS !== 'web') {
       await SecureStore.deleteItemAsync(USER_PROFILE_KEY).catch(e => console.error("Failed to clear storage on logout", e));
       }
      setIsLoading(false);
      // Navigation should be handled by RootLayout based on cleared auth state
    }
  };

  // Clear any displayed auth errors
  const clearError = () => {
    setError(null);
  };

  // Allow manually refreshing the profile if needed
  const refreshUserProfile = async () => {
     if (authUser?.id) {
        setIsLoading(true);
        await fetchUserProfile(authUser.id);
        setIsLoading(false);
     } else {
        console.warn("Cannot refresh profile: No authenticated user.");
     }
  };


  // Context value
  const value = {
    user, // User profile from public.users
    authUser, // Supabase auth user
    session,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 