/**
 * Chrome Extension locale adapter
 */

import { BaseLocaleAdapter } from './base';

declare const chrome: any;

export class ExtensionLocaleAdapter extends BaseLocaleAdapter {
  constructor(private i18nService?: { changeLanguage: (locale: string) => void }) {
    super();
  }

  async getAcceptLanguages(): Promise<string[]> {
    if (typeof chrome === 'undefined' || !chrome.i18n) {
      console.warn('Chrome i18n API not available, using default locale');
      return ['en'];
    }

    return new Promise((resolve) => {
      chrome.i18n.getAcceptLanguages((languages: string[]) => {
        resolve(languages || ['en']);
      });
    });
  }

  changeLanguage(locale: string): void {
    if (this.i18nService && typeof this.i18nService.changeLanguage === 'function') {
      try {
        this.i18nService.changeLanguage(locale);
      } catch (error) {
        console.error('Failed to change language:', error);
      }
    }
  }
}