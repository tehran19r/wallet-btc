/**
 * Mobile locale adapter
 */

import { BaseLocaleAdapter } from './base';

export class MobileLocaleAdapter extends BaseLocaleAdapter {
  constructor(private defaultLocale: string = 'en') {
    super();
  }

  async getAcceptLanguages(): Promise<string[]> {
    // On mobile, we typically get locale from device settings
    // For now, return the default locale
    return [this.defaultLocale];
  }

  changeLanguage(locale: string): void {
    // Mobile apps might handle language changes differently
    // This could trigger app-wide locale updates
    console.log(`Language changed to: ${locale}`);
  }
}