/**
 * React Native storage adapter
 */

import { BaseStorageAdapter } from './base'

// This would typically use AsyncStorage from React Native
// For now, we'll create an interface that can be implemented
export interface ReactNativeStorage {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
}

export class MobileStorageAdapter extends BaseStorageAdapter {
  constructor(private storage: ReactNativeStorage) {
    super()
  }

  async get(key: string): Promise<any> {
    try {
      const value = await this.storage.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error(`Failed to get item ${key} from mobile storage:`, error)
      return null
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      await this.storage.set(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to set item ${key} in mobile storage:`, error)
      throw error
    }
  }
}
