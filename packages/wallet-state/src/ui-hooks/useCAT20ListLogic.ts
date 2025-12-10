import { useEffect, useRef, useState } from 'react'

import { CAT20Balance, CAT_VERSION, TickPriceItem } from '@unisat/wallet-shared'

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

export function useCAT20ListLogic(version: CAT_VERSION) {
  const nav = useNavigation()
  const wallet = useWallet()
  const currentAccount = useCurrentAccount()
  const chainType = useChainType()
  const [priceMap, setPriceMap] = useState<{ [key: string]: TickPriceItem }>({})

  const priceMapRef = useRef(priceMap)
  const updatePrices = (res: { [tick: string]: TickPriceItem }) => {
    const newPriceMap = { ...priceMapRef.current }
    Object.keys(res).forEach(tick => {
      newPriceMap[tick] = res[tick]
    })
    priceMapRef.current = newPriceMap
    setPriceMap(newPriceMap)
  }

  const {
    data: tokens,
    total,
    loading,
    hasMore,
    onRefresh,
    onLoadMore,
  } = useInfiniteList<CAT20Balance>({
    fetcher: async (page, pageSize) => {
      const supportedAssets = getSupportedAssets(chainType, currentAccount.address)
      if (!supportedAssets.assets.CAT20 || currentAccount.address === '') {
        return { list: [], total: 0 }
      }
      const { list, total } = await wallet.getCAT20List(
        version,
        currentAccount.address,
        page,
        pageSize
      )
      if (list.length > 0) {
        wallet.getCAT20sPrice(list.map(item => item.tokenId)).then(updatePrices)
      }
      return { list, total }
    },
    dependencies: [currentAccount.address, version, chainType],
  })

  const tabKey = useCATAssetTabKey()
  const isFocus = tabKey === CATAssetTabKey.CAT20 || CATAssetTabKey.CAT20_V2
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

  const onClickItem = (item: CAT20Balance) => {
    nav.navigate('CAT20TokenScreen', { tokenId: item.tokenId, version })
  }

  return { tokens, total, loading, hasMore, onRefresh, onLoadMore, onClickItem, priceMap }
}
