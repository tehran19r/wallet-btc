/**
 * Memory storage adapter for testing
 */

import { BaseStorageAdapter } from './base';

export class MemoryStorageAdapter extends BaseStorageAdapter {
  private storage = new Map<string, any>();

  async get(key: string): Promise<any> {
    return this.storage.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    this.storage.set(key, value);
  }

  clear(): void {
    this.storage.clear();
  }
}