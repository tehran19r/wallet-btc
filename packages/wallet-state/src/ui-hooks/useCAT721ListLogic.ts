import { useEffect, useRef } from 'react'

import { CAT721Balance, CAT_VERSION } from '@unisat/wallet-shared'

import {
  CATAssetTabKey,
  getSupportedAssets,
  useCATAssetTabKey,
  useChainType,
  useCurrentAccount,
  useNavigation,
  useWallet,
  useWallTabFocusRefresh,
} from '..'
import { useInfiniteList } from './useInfiniteList'

export function useCAT721ListLogic(version: CAT_VERSION) {
  const nav = useNavigation()
  const wallet = useWallet()
  const currentAccount = useCurrentAccount()
  const chainType = useChainType()
  const {
    data: tokens,
    total,
    loading,
    hasMore,
    onRefresh,
    onLoadMore,
  } = useInfiniteList<CAT721Balance>({
    fetcher: async (page, pageSize) => {
      const supportedAssets = getSupportedAssets(chainType, currentAccount.address)
      if (!supportedAssets.assets.CAT20 || currentAccount.address === '') {
        return { list: [], total: 0 }
      }
      const { list, total } = await wallet.getCAT721List(
        version,
        currentAccount.address,
        page,
        pageSize
      )
      return { list, total }
    },
    dependencies: [currentAccount.address, version, chainType],
  })

  const tabKey = useCATAssetTabKey()
  const isFocus = tabKey === CATAssetTabKey.CAT721 || CATAssetTabKey.CAT721_V2
  const lastRefreshTimeRef = useRef<number>(0)
  const walletTabFocusRefresh = useWallTabFocusRefresh()
  useEffect(() => {
    if (!isFocus) return

    // already refreshed → do nothing
    const alreadyRefreshed = lastRefreshTimeRef.current === walletTabFocusRefresh
    if (alreadyRefreshed) return

    onRefresh()

    // mark refreshed
    lastRefreshTimeRef.current = walletTabFocusRefresh
  }, [walletTabFocusRefresh, isFocus])

  const onClickItem = (item: CAT721Balance) => {
    nav.navigate('CAT721CollectionScreen', { collectionId: item.collectionId, version })
  }

  return { tokens, total, loading, hasMore, onRefresh, onLoadMore, onClickItem }
}
