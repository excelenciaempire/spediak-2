import Constants from 'expo-constants';

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

// Authentication API calls
export const authApi = {
  // Register a new user
  async register(email: string, password: string, fullName: string, state: string): Promise<AuthResponse> {
    try {
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
      const response = await fetch(`${API_URL}/auth/verify/${token}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Inspection API calls
export const inspectionApi = {
  // Generate DDID from image and description
  async generateDDID(
    imageUrl: string, 
    description: string, 
    state: string, 
    token: string
  ): Promise<ApiResponse<{ ddidResponse: string }>> {
    try {
      const response = await fetch(`${API_URL}/inspections/generate-ddid`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ imageUrl, description, state }),
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
      const response = await fetch(`${API_URL}/inspections`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ userId, imageUrl, description, ddidResponse }),
      });
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get all inspections for a user
  async getInspections(userId: string, token: string): Promise<ApiResponse<{ inspections: Inspection[] }>> {
    try {
      const response = await fetch(`${API_URL}/inspections?userId=${userId}`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get a specific inspection
  async getInspection(id: string, userId: string, token: string): Promise<ApiResponse<{ inspection: Inspection }>> {
    try {
      const response = await fetch(`${API_URL}/inspections/${id}?userId=${userId}`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// User API calls
export const userApi = {
  // Get user profile
  async getProfile(userId: string, token: string): Promise<ApiResponse<{ user: User }>> {
    try {
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