import logger from 'loglevel'

import { ExtensionAdapter, PhishingAdapter, PhishingService } from '@unisat/phishing-detect'
import { t } from '@unisat/wallet-shared'

/**
 * Phishing detection service - extends the base PhishingService with extension-specific functionality
 */
class PhishingDetectServiceWrapper extends PhishingService {
  constructor() {
    const storage: PhishingAdapter = new ExtensionAdapter()

    // Call parent constructor with extension-compatible storage
    super({
      adapter: storage,
      logger,
      t: t,
    })
  }

  async init(): Promise<void> {
    console.log('[PhishingService] Initialized')
  }
}

const phishingDetectService = new PhishingDetectServiceWrapper()

export default phishingDetectService
