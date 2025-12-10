import { RuneBalance, TickPriceItem } from '@unisat/wallet-shared'
import { useEffect, useRef, useState } from 'react'
import {
  AssetTabKey,
  useAssetTabKey,
  useChainType,
  useCurrentAccount,
  useNavigation,
  useWallet,
  useWallTabFocusRefresh,
} from '..'
import { useInfiniteList } from './useInfiniteList'

export function useRunesListLogic() {
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
    data: items,
    total,
    loading,
    hasMore,
    onRefresh,
    onLoadMore,
  } = useInfiniteList<RuneBalance>({
    fetcher: async (page, pageSize) => {
      if (currentAccount.address === '') {
        return { list: [], total: 0 }
      }
      const { list, total } = await wallet.getRunesList(currentAccount.address, page, pageSize)
      if (list.length > 0) {
        wallet.getRunesPrice(list.map(item => item.spacedRune)).then(updatePrices)
      }
      return { list, total }
    },
    dependencies: [currentAccount.address, chainType],
  })

  const assetTabKey = useAssetTabKey()
  const isFocus = assetTabKey === AssetTabKey.RUNES
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

  const onClickItem = (item: RuneBalance) => {
    nav.navigate('RunesTokenScreen', { runeid: item.runeid })
  }

  return { items, total, loading, hasMore, onRefresh, onLoadMore, onClickItem, priceMap }
}
