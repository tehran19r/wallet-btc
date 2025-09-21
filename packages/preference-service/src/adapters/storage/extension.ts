/**
 * Chrome Extension storage adapter
 */

import { BaseStorageAdapter } from './base';

declare const chrome: any;

export class ExtensionStorageAdapter extends BaseStorageAdapter {
  async get(key: string): Promise<any> {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      throw new Error('Chrome storage API not available');
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result: any) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  async set(key: string, value: any): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      throw new Error('Chrome storage API not available');
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }
}