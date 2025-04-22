import Constants from 'expo-constants';
import { storageService } from './storage';
import NetInfo from '@react-native-community/netinfo';

// Define API base URL
// In development, this would point to your local server
// In production, this would point to your deployed backend
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api/v1';

// Types for API requests and responses
export interface User {
  id: string;
  email: string;
  fullName: string;
  state: string;
  profileImageUrl: string | null;
  createdAt: string;
}

export interface Inspection {
  id: string;
  userId: string;
  imageUrl: string;
  description: string;
  ddidResponse: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

// Helper function for handling API errors
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  if (error.response && error.response.data) {
    throw new Error(error.response.data.message || 'An error occurred');
  }
  throw new Error('Network error or server unavailable');
};

// Helper function to set common headers including auth token
const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Check if device is online
const isOnline = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected ?? false;
};

// Authentication API calls
export const authApi = {
  // Register a new user
  async register(email: string, password: string, fullName: string, state: string): Promise<AuthResponse> {
    try {
      const online = await isOnline();
      if (!online) {
        throw new Error('No internet connection. Please try again when you\'re online.');
      }
      
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password, fullName, state }),
      });
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Login an existing user
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const online = await isOnline();
      if (!online) {
        throw new Error('No internet connection. Please try again when you\'re online.');
      }
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Verify email with token
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    try {
      const online = await isOnline();
      if (!online) {
        throw new Error('No internet connection. Please try again when you\'re online.');
      }
      
      const response = await fetch(`${API_URL}/auth/verify/${token}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Log out user and clear local data
  async logout(userId: string): Promise<void> {
    try {
      // Clear all user data from local storage
      await storageService.clearAllUserData(userId);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },
};

// Inspection API calls
export const inspectionApi = {
  // Generate DDID from image and description
  async generateDDID(
    imageUrl: string, 
    description: string, 
    userId: string, 
    token: string
  ): Promise<ApiResponse<{ ddidResponse: string }>> {
    try {
      const online = await isOnline();
      if (!online) {
        throw new Error('No internet connection. DDID generation requires internet connectivity.');
      }
      
      const response = await fetch(`${API_URL}/inspections/generate-ddid`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ imageUrl, description, userId }),
      });
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Save a new inspection
  async saveInspection(
    userId: string,
    imageUrl: string,
    description: string,
    ddidResponse: string,
    token: string
  ): Promise<ApiResponse<{ inspection: Inspection }>> {
    try {
      const online = await isOnline();
      
      // Create inspection object
      const newInspection: Inspection = {
        id: Date.now().toString(), // Temporary ID until we get a real one from the server
        userId,
        imageUrl,
        description,
        ddidResponse,
        createdAt: new Date().toISOString(),
      };
      
      // If offline, save to local storage and queue for later sync
      if (!online) {
        // Save to local storage
        await storageService.addInspection(userId, newInspection);
        
        // Add to offline queue for later sync
        await storageService.addToOfflineQueue(userId, {
          type: 'create',
          data: {
            imageUrl,
            description,
            ddidResponse,
          },
        });
        
        // Return local response
        return {
          success: true,
          message: 'Inspection saved locally. It will be synced when online.',
          data: {
            inspection: newInspection,
          },
        };
      }
      
      // If online, send to server
      const response = await fetch(`${API_URL}/inspections`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ userId, imageUrl, description, ddidResponse }),
      });
      
      const result = await response.json();
      
      // If successful, save to local storage
      if (result.success && result.data) {
        await storageService.addInspection(userId, result.data.inspection);
      }
      
      return result;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get all inspections for a user
  async getInspections(userId: string, token: string): Promise<ApiResponse<{ inspections: Inspection[] }>> {
    try {
      const online = await isOnline();
      
      // If offline, get from local storage
      if (!online) {
        const localInspections = await storageService.getInspections(userId);
        return {
          success: true,
          message: 'Loaded from local storage (offline mode)',
          data: {
            inspections: localInspections,
          },
        };
      }
      
      // If online, try to get from server and update local storage
      try {
        const response = await fetch(`${API_URL}/inspections?userId=${userId}`, {
          method: 'GET',
          headers: getHeaders(token),
        });
        
        const result = await response.json();
        
        // If successful, update local storage
        if (result.success && result.data) {
          await storageService.saveInspections(userId, result.data.inspections);
          await storageService.updateLastSyncTimestamp(userId);
          
          // Process offline queue if any
          await this.syncOfflineQueue(userId, token);
        }
        
        return result;
      } catch (serverError) {
        console.error('Server error, falling back to local storage:', serverError);
        
        // Fall back to local storage
        const localInspections = await storageService.getInspections(userId);
        return {
          success: true,
          message: 'Server unavailable. Loaded from local storage.',
          data: {
            inspections: localInspections,
          },
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get a specific inspection
  async getInspection(id: string, userId: string, token: string): Promise<ApiResponse<{ inspection: Inspection }>> {
    try {
      const online = await isOnline();
      
      // If offline, get from local storage
      if (!online) {
        const localInspections = await storageService.getInspections(userId);
        const inspection = localInspections.find(insp => insp.id === id);
        
        if (!inspection) {
          return {
            success: false,
            message: 'Inspection not found in local storage',
          };
        }
        
        return {
          success: true,
          message: 'Loaded from local storage (offline mode)',
          data: {
            inspection,
          },
        };
      }
      
      // If online, get from server
      const response = await fetch(`${API_URL}/inspections/${id}?userId=${userId}`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Sync offline queue with server
  async syncOfflineQueue(userId: string, token: string): Promise<void> {
    try {
      const online = await isOnline();
      if (!online) {
        console.log('Cannot sync offline queue: device is offline');
        return;
      }
      
      const queue = await storageService.getOfflineQueue(userId);
      if (queue.length === 0) {
        return;
      }
      
      console.log(`Processing ${queue.length} items in offline queue`);
      
      for (const item of queue) {
        try {
          if (item.type === 'create') {
            // Create inspection on server
            await fetch(`${API_URL}/inspections`, {
              method: 'POST',
              headers: getHeaders(token),
              body: JSON.stringify({ userId, ...item.data }),
            });
          } else if (item.type === 'update') {
            // Update inspection on server
            await fetch(`${API_URL}/inspections/${item.data.id}`, {
              method: 'PUT',
              headers: getHeaders(token),
              body: JSON.stringify({ userId, ...item.data }),
            });
          } else if (item.type === 'delete') {
            // Delete inspection on server
            await fetch(`${API_URL}/inspections/${item.data.id}?userId=${userId}`, {
              method: 'DELETE',
              headers: getHeaders(token),
            });
          }
          
          // Remove processed item from queue
          await storageService.removeFromOfflineQueue(userId, item.id);
        } catch (error) {
          console.error(`Error processing queue item ${item.id}:`, error);
          // Continue with next item
        }
      }
      
      console.log('Offline queue processed');
    } catch (error) {
      console.error('Error syncing offline queue:', error);
    }
  },
};

// User API calls
export const userApi = {
  // Get user profile
  async getProfile(userId: string, token: string): Promise<ApiResponse<{ user: User }>> {
    try {
      const online = await isOnline();
      if (!online) {
        throw new Error('No internet connection. Unable to load profile.');
      }
      
      const response = await fetch(`${API_URL}/user/profile?userId=${userId}`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Update user profile
  async updateProfile(
    userId: string,
    data: { fullName?: string; state?: string; profileImageUrl?: string },
    token: string
  ): Promise<ApiResponse<{ user: User }>> {
    try {
      const online = await isOnline();
      if (!online) {
        // Add to offline queue for later update
        await storageService.addToOfflineQueue(userId, {
          type: 'update',
          data: {
            id: userId,
            ...data,
          },
        });
        
        return {
          success: true,
          message: 'Profile update queued for when you\'re back online',
        };
      }
      
      const response = await fetch(`${API_URL}/user/profile?userId=${userId}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      });
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Update user password
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    token: string
  ): Promise<ApiResponse<void>> {
    try {
      const online = await isOnline();
      if (!online) {
        throw new Error('No internet connection. Password update requires internet connectivity.');
      }
      
      const response = await fetch(`${API_URL}/user/password?userId=${userId}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
}; 