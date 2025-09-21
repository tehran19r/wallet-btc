/**
 * React Native storage adapter
 */

import { BaseStorageAdapter } from './base';

// This would typically use AsyncStorage from React Native
// For now, we'll create an interface that can be implemented
export interface ReactNativeStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export class MobileStorageAdapter extends BaseStorageAdapter {
  constructor(private storage: ReactNativeStorage) {
    super();
  }

  async get(key: string): Promise<any> {
    try {
      const value = await this.storage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to get item ${key} from mobile storage:`, error);
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      await this.storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set item ${key} in mobile storage:`, error);
      throw error;
    }
  }
}