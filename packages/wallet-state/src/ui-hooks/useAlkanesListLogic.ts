import { useEffect, useRef, useState } from 'react'

import { AlkanesBalance, TickPriceItem } from '@unisat/wallet-shared'

import {
  AlkanesAssetTabKey,
  getSupportedAssets,
  useAlkanesAssetTabKey,
  useChainType,
  useCurrentAccount,
  useNavigation,
  useWallet,
  useWallTabFocusRefresh,
} from '..'
import { useInfiniteList } from './useInfiniteList'

export function useAlkanesListLogic() {
  const nav = useNavigation()
  const wallet = useWallet()
  const currentAccount = useCurrentAccount()
  const chainType = useChainType()
  const [priceMap, setPriceMap] = useState<{ [key: string]: TickPriceItem }>({})

  const {
    data: items,
    total,
    loading,
    hasMore,
    onRefresh,
    onLoadMore,
  } = useInfiniteList<AlkanesBalance>({
    fetcher: async (page, pageSize) => {
      const supportedAssets = getSupportedAssets(chainType, currentAccount.address)
      if (!supportedAssets.assets.alkanes || currentAccount.address === '') {
        return { list: [], total: 0 }
      }

      const { list, total } = await wallet.getAlkanesList(currentAccount.address, page, pageSize)
      if (list.length > 0) {
        wallet.getAlkanesPrice(list.map(item => item.alkaneid)).then(setPriceMap)
      }
      return { list, total }
    },
    dependencies: [currentAccount.address, chainType],
  })

  const tabKey = useAlkanesAssetTabKey()
  const isFocus = tabKey === AlkanesAssetTabKey.TOKEN
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

  const onClickItem = (item: AlkanesBalance) => {
    nav.navigate('AlkanesTokenScreen', { alkaneid: item.alkaneid })
  }

  return { items, total, loading, hasMore, onRefresh, onLoadMore, onClickItem, priceMap }
}
