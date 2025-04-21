import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, authApi } from '@/services/api';
import { router } from 'expo-router';

// Define the auth context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, state: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  clearError: () => {},
});

// Keys for secure storage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load stored auth state on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Handle login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(email, password);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }

      const { user: userData, token: authToken } = response.data;
      
      // Store auth state securely
      await SecureStore.setItemAsync(TOKEN_KEY, authToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setToken(authToken);
      
      // Navigate to app
      router.replace('/(app)');
    } catch (error: any) {
      setError(error.message || 'Failed to login. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup
  const signup = async (email: string, password: string, fullName: string, state: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(email, password, fullName, state);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Signup failed');
      }

      const { user: userData, token: authToken } = response.data;
      
      // Store auth state securely
      await SecureStore.setItemAsync(TOKEN_KEY, authToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setToken(authToken);
      
      // Navigate to verification or app
      router.replace('/(auth)/verify-email');
    } catch (error: any) {
      setError(error.message || 'Failed to create account. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const logout = async () => {
    setIsLoading(true);
    try {
      // Clear secure storage
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      
      // Clear state
      setUser(null);
      setToken(null);
      
      // Navigate to login
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear any auth errors
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    user,
    token,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
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