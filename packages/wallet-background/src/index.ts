/**
 * UniSat Wallet Background - Main exports
 */

// Adapters for cross-platform compatibility
export * from './adapters'

// Controllers
export { phishingController, providerController, walletController } from './controllers'

// Services
export {
  contactBookService,
  keyringService,
  notificationService,
  permissionService,
  phishingDetectService,
  preferenceService,
  sessionService,
  walletApiService,
} from './services'

// webapi
export { notification } from './webapi'

// Shared types and constants
export * from './shared/types'

// Utils
export { brc20Utils } from './utils/brc20-utils'
export { namesUtils } from './utils/names-utils'

export { initPersistStoreStorage } from './utils/persistStore'

export { bgEventBus } from './utils/eventBus'
