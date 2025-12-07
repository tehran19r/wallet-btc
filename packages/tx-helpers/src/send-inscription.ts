import { NetworkType } from '@unisat/wallet-types'
import { Transaction } from './transaction/transaction'
import { utxoHelper } from './transaction/utxo'
import { UnspentOutput } from './types'
import { bitcoin } from '@unisat/wallet-bitcoin'
import { ErrorCodes, WalletError } from '@unisat/wallet-shared'

export async function sendInscription({
  assetUtxo,
  btcUtxos,
  toAddress,
  networkType,
  changeAddress,
  feeRate,
  outputValue,
  enableMixed = false,
}: {
  assetUtxo: UnspentOutput
  btcUtxos: UnspentOutput[]
  toAddress: string
  networkType: NetworkType
  changeAddress: string
  feeRate: number
  outputValue: number
  enableMixed?: boolean
}): Promise<{
  psbt: bitcoin.Psbt
  toSignInputs: any[]
}> {
  if (utxoHelper.hasAnyAssets(btcUtxos)) {
    throw new WalletError(ErrorCodes.NOT_SAFE_UTXOS)
  }

  if (!enableMixed && assetUtxo.inscriptions.length !== 1) {
    throw new WalletError(ErrorCodes.NOT_SAFE_UTXOS)
  }

  const maxOffset = assetUtxo.inscriptions.reduce((pre, cur) => {
    return Math.max(pre, cur.offset)
  }, 0)

  if (outputValue - 1 < maxOffset) {
    throw new WalletError(ErrorCodes.ASSET_MAYBE_LOST)
  }

  const tx = new Transaction()
  tx.setNetworkType(networkType)
  tx.setFeeRate(feeRate)
  tx.setEnableRBF(true)
  tx.setChangeAddress(changeAddress)

  tx.addInput(assetUtxo)
  tx.addOutput(toAddress, outputValue)

  const toSignInputs = await tx.addSufficientUtxosForFee(btcUtxos)
  toSignInputs.push({
    index: 0,
    publicKey: assetUtxo.pubkey,
  })

  const psbt = tx.toPsbt()

  return { psbt, toSignInputs }
}
