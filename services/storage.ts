import AsyncStorage from '@react-native-async-storage/async-storage';
import { Inspection } from './api';

// Storage keys
const STORAGE_KEYS = {
  INSPECTIONS: 'spediak_inspections',
  USER_PREFERENCES: 'spediak_user_preferences',
  OFFLINE_QUEUE: 'spediak_offline_queue',
  LAST_SYNC: 'spediak_last_sync',
};

// Interfaces
export interface UserPreferences {
  sortOrder: 'newest' | 'oldest';
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
}

export interface OfflineQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  sortOrder: 'newest',
  theme: 'light',
  notificationsEnabled: true,
};

// Storage service for managing app data locally
export const storageService = {
  // Inspections
  async saveInspections(userId: string, inspections: Inspection[]): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.INSPECTIONS}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(inspections));
      console.log('Inspections saved to local storage');
    } catch (error) {
      console.error('Error saving inspections to local storage:', error);
      throw error;
    }
  },

  async getInspections(userId: string): Promise<Inspection[]> {
    try {
      const key = `${STORAGE_KEYS.INSPECTIONS}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading inspections from local storage:', error);
      return [];
    }
  },

  async addInspection(userId: string, inspection: Inspection): Promise<void> {
    try {
      const inspections = await this.getInspections(userId);
      inspections.unshift(inspection); // Add to beginning of array (newest first)
      await this.saveInspections(userId, inspections);
    } catch (error) {
      console.error('Error adding inspection to local storage:', error);
      throw error;
    }
  },

  async removeInspection(userId: string, inspectionId: string): Promise<void> {
    try {
      const inspections = await this.getInspections(userId);
      const updatedInspections = inspections.filter(
        (inspection) => inspection.id !== inspectionId
      );
      await this.saveInspections(userId, updatedInspections);
    } catch (error) {
      console.error('Error removing inspection from local storage:', error);
      throw error;
    }
  },

  // User Preferences
  async saveUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.USER_PREFERENCES}_${userId}`;
      const currentPrefs = await this.getUserPreferences(userId);
      const updatedPrefs = { ...currentPrefs, ...preferences };
      await AsyncStorage.setItem(key, JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('Error saving user preferences to local storage:', error);
      throw error;
    }
  },

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const key = `${STORAGE_KEYS.USER_PREFERENCES}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Error loading user preferences from local storage:', error);
      return DEFAULT_PREFERENCES;
    }
  },

  // Offline Queue
  async addToOfflineQueue(userId: string, item: Omit<OfflineQueueItem, 'id' | 'timestamp'>): Promise<void> {
    try {
      const queue = await this.getOfflineQueue(userId);
      const newItem: OfflineQueueItem = {
        ...item,
        id: Date.now().toString(), // Generate a unique ID
        timestamp: Date.now(),
      };
      queue.push(newItem);
      await this.saveOfflineQueue(userId, queue);
    } catch (error) {
      console.error('Error adding item to offline queue:', error);
      throw error;
    }
  },

  async getOfflineQueue(userId: string): Promise<OfflineQueueItem[]> {
    try {
      const key = `${STORAGE_KEYS.OFFLINE_QUEUE}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading offline queue from local storage:', error);
      return [];
    }
  },

  async saveOfflineQueue(userId: string, queue: OfflineQueueItem[]): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.OFFLINE_QUEUE}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving offline queue to local storage:', error);
      throw error;
    }
  },

  async removeFromOfflineQueue(userId: string, itemId: string): Promise<void> {
    try {
      const queue = await this.getOfflineQueue(userId);
      const updatedQueue = queue.filter((item) => item.id !== itemId);
      await this.saveOfflineQueue(userId, updatedQueue);
    } catch (error) {
      console.error('Error removing item from offline queue:', error);
      throw error;
    }
  },

  // Sync Timestamp
  async updateLastSyncTimestamp(userId: string): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.LAST_SYNC}_${userId}`;
      await AsyncStorage.setItem(key, Date.now().toString());
    } catch (error) {
      console.error('Error updating last sync timestamp:', error);
      throw error;
    }
  },

  async getLastSyncTimestamp(userId: string): Promise<number | null> {
    try {
      const key = `${STORAGE_KEYS.LAST_SYNC}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? parseInt(data) : null;
    } catch (error) {
      console.error('Error getting last sync timestamp:', error);
      return null;
    }
  },

  // Clear All Data
  async clearAllUserData(userId: string): Promise<void> {
    try {
      const keys = [
        `${STORAGE_KEYS.INSPECTIONS}_${userId}`,
        `${STORAGE_KEYS.USER_PREFERENCES}_${userId}`,
        `${STORAGE_KEYS.OFFLINE_QUEUE}_${userId}`,
        `${STORAGE_KEYS.LAST_SYNC}_${userId}`,
      ];
      await AsyncStorage.multiRemove(keys);
      console.log('All user data cleared from local storage');
    } catch (error) {
      console.error('Error clearing user data from local storage:', error);
      throw error;
    }
  },
}; 