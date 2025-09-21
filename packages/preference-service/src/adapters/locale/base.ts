/**
 * Base locale adapter
 */

import { LocaleAdapter } from '../../types';

export abstract class BaseLocaleAdapter implements LocaleAdapter {
  abstract getAcceptLanguages(): Promise<string[]>;
  abstract changeLanguage(locale: string): void;

  /**
   * Filter supported locales from browser languages
   */
  protected filterSupportedLocales(languages: string[], supported: string[]): string[] {
    return languages
      .map(lang => lang.replace(/-/g, '_'))
      .filter(lang => supported.includes(lang));
  }
}