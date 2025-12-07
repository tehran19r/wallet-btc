import { WalletApiService } from '@unisat/wallet-api'

// Create and export singleton instance
const walletApiService = new WalletApiService()

export { walletApiService }
export default walletApiService
