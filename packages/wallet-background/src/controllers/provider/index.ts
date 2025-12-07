// Provider controller for handling RPC requests
import { ErrorCodes, WalletError } from '@unisat/wallet-shared'
import { keyringService } from '../../services'
import internalMethod from './internalMethod'
import rpcFlow from './rpcFlow'

class ProviderController {
  async handleRequest(req: any) {
    const {
      data: { method },
    } = req

    if (internalMethod[method]) {
      return internalMethod[method](req)
    }

    const hasVault = keyringService.hasVault()
    if (!hasVault) {
      throw new WalletError(ErrorCodes.UserCancel, 'wallet must has at least one account')
    }
    return rpcFlow(req)
  }
}

export default new ProviderController()
