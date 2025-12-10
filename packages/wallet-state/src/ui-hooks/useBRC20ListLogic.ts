import { TickPriceItem, TokenBalance } from '@unisat/wallet-shared'
import { useEffect, useRef, useState } from 'react'
import {
  OrdinalsAssetTabKey,
  useChainType,
  useCurrentAccount,
  useNavigation,
  useOrdinalsAssetTabKey,
  useWallet,
  useWallTabFocusRefresh,
} from '..'
import { useInfiniteList } from './useInfiniteList'

export function useBRC20ListLogic() {
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
  } = useInfiniteList<TokenBalance>({
    fetcher: async (page, pageSize) => {
      if (currentAccount.address === '') {
        return { list: [], total: 0 }
      }
      const { list, total } = await wallet.getBRC20List(currentAccount.address, page, pageSize)
      if (list.length > 0) {
        wallet.getBrc20sPrice(list.map(item => item.ticker)).then(updatePrices)
      }
      return { list, total }
    },
    dependencies: [currentAccount.address, chainType],
  })

  const tabKey = useOrdinalsAssetTabKey()
  const isFocus = tabKey === OrdinalsAssetTabKey.BRC20
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

  const onClickItem = (item: TokenBalance) => {
    nav.navigate('BRC20TokenScreen', { tokenBalance: item, ticker: item.ticker })
  }

  return { items, total, loading, hasMore, onRefresh, onLoadMore, onClickItem, priceMap }
}
