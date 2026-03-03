import { ChainType } from '@unisat/wallet-types'
import { useChainType } from 'src/hooks'

export function useBtcDisplayLogic(balance: string) {
  const chainType = useChainType()

  const totalAmountMainPart =
    chainType === ChainType.BITCOIN_MAINNET ? balance.slice(0, -4) : balance.slice(0, -8)
  const totalAmountSubPart =
    chainType === ChainType.BITCOIN_MAINNET ? balance.slice(-4) : balance.slice(-8)

  return {
    totalAmountMainPart,
    totalAmountSubPart,
  }
}
