import { bnUtils } from '@unisat/base-utils'
import {
  AlkanesBalance,
  AlkanesInfo,
  Inscription,
  TxType,
  UserToSignInput,
} from '@unisat/wallet-shared'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n, useNavigation, useTools, useWallet } from 'src/context'
import { useCurrentAccount, useFeeRateBar, usePushBitcoinTxCallback } from 'src/hooks'
import { isValidAddress } from 'src/utils/bitcoin-utils'

export enum SendAlkanesScreenStep {
  CREATE_TX = 0,
  SIGN_TX = 1,
}

export function useSendAlkanesScreenLogic() {
  const nav = useNavigation()
  const props = nav.getRouteState<{
    tokenBalance: AlkanesBalance
    tokenInfo: AlkanesInfo
  }>()

  const { t } = useI18n()

  const tokenBalance = props.tokenBalance

  const tokenInfo = props.tokenInfo

  const [inputAmount, setInputAmount] = useState('')
  const [disabled, setDisabled] = useState(true)
  const [toInfo, setToInfo] = useState<{
    address: string
    domain: string
    inscription?: Inscription
  }>({
    address: '',
    domain: '',
    inscription: undefined,
  })

  const [availableBalance, setAvailableBalance] = useState(tokenBalance.amount)
  const [error, setError] = useState('')

  const totalBalanceStr = useMemo(() => {
    return bnUtils.toDecimalAmount(tokenBalance.amount, tokenBalance.divisibility)
  }, [tokenBalance])
  const availableBalanceStr = useMemo(() => {
    return bnUtils.toDecimalAmount(availableBalance, tokenBalance?.divisibility)
  }, [availableBalance, tokenBalance])

  const currentAccount = useCurrentAccount()

  const tools = useTools()

  const { feeRate } = useFeeRateBar()

  useEffect(() => {
    const run = async () => {
      const tokenSummary = await wallet.getAddressAlkanesTokenSummary(
        currentAccount.address,
        tokenBalance.alkaneid,
        true
      )
      setAvailableBalance(tokenSummary.tokenBalance.available)
    }

    run()
  }, [])

  useEffect(() => {
    setError('')
    setDisabled(true)

    if (!isValidAddress(toInfo.address)) {
      return
    }
    if (!inputAmount) {
      return
    }

    if (feeRate <= 0) {
      return
    }

    const sendingAmount = bnUtils.fromDecimalAmount(inputAmount, tokenBalance.divisibility)

    if (bnUtils.compareAmount(sendingAmount, '0') <= 0) {
      return
    }

    if (bnUtils.compareAmount(sendingAmount, availableBalance)! > 0) {
      setError(t('send_amount_exceeds_balance'))
      return
    }

    setDisabled(false)
  }, [toInfo, inputAmount, availableBalance, feeRate])

  const transferData = useRef<{
    id: string
    commitTx: string
    commitToSignInputs: UserToSignInput[]
  }>({
    id: '',
    commitTx: '',
    commitToSignInputs: [],
  })

  const [step, setStep] = useState(SendAlkanesScreenStep.CREATE_TX)

  const wallet = useWallet()

  const pushBitcoinTx = usePushBitcoinTxCallback()

  const onClickBack = () => {
    nav.goBack()
  }

  const onClickNext = async () => {
    tools.showLoading(true)
    try {
      const step1 = await wallet.createAlkanesSendTx({
        userAddress: currentAccount.address,
        userPubkey: currentAccount.pubkey,
        receiver: toInfo.address,
        alkaneid: tokenBalance.alkaneid,
        amount: bnUtils.fromDecimalAmount(inputAmount, tokenBalance.divisibility),
        feeRate,
      })
      if (step1) {
        transferData.current.commitTx = step1.psbtHex
        transferData.current.commitToSignInputs = step1.toSignInputs
        setStep(1)
      }
    } catch (e) {
      const msg = (e as any).message
      setError((e as any).message)
    } finally {
      tools.showLoading(false)
    }
  }

  const signPsbtParams = {
    data: {
      psbtHex: transferData.current.commitTx,
      type: TxType.SIGN_TX,
      options: { autoFinalized: true, toSignInputs: transferData.current.commitToSignInputs },
    },
  }

  const onSignPsbtHandleConfirm = async res => {
    tools.showLoading(true)
    try {
      if (res && res.psbtHex) {
        const { success, txid, error } = await pushBitcoinTx(res.psbtHex)
        if (success) {
          nav.navigate('TxSuccessScreen', { txid })
        } else {
          throw new Error(error)
        }
        return
      }

      const result = await wallet.signAlkanesSendTx({
        commitTx: transferData.current.commitTx,
        toSignInputs: transferData.current.commitToSignInputs as any,
      })
      nav.navigate('TxSuccessScreen', { txid: result.txid })
    } catch (e) {
      nav.navigate('TxFailScreen', { error: (e as any).message })
    } finally {
      tools.showLoading(false)
    }
  }

  const onSignPsbtHandleCancel = () => {
    setStep(SendAlkanesScreenStep.CREATE_TX)
  }

  const onSignPsbtHandleBack = () => {
    setStep(SendAlkanesScreenStep.CREATE_TX)
  }
  return {
    step,
    t,
    tokenBalance,
    tokenInfo,
    toInfo,
    totalBalanceStr,
    availableBalanceStr,

    inputAmount,
    disabled,
    error,

    // actions
    setToInfo,
    setInputAmount,
    onClickBack,
    onClickNext,

    // sign psbt actions
    onSignPsbtHandleConfirm,
    onSignPsbtHandleCancel,
    onSignPsbtHandleBack,
    signPsbtParams,
  }
}
