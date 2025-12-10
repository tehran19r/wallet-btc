import { Inscription } from '@unisat/wallet-shared'

import { useEffect, useRef } from 'react'
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

export function useInscriptionListLogic() {
  const nav = useNavigation()
  const wallet = useWallet()
  const currentAccount = useCurrentAccount()
  const chainType = useChainType()

  const {
    data: items,
    total,
    loading,
    hasMore,
    onRefresh,
    onLoadMore,
  } = useInfiniteList<Inscription>({
    fetcher: async (page, pageSize) => {
      if (currentAccount.address === '') {
        return { list: [], total: 0 }
      }
      const { list, total } = await wallet.getAllInscriptionList(
        currentAccount.address,
        page,
        pageSize
      )
      return { list, total }
    },
    dependencies: [currentAccount.address, chainType],
  })

  const tabKey = useOrdinalsAssetTabKey()
  const isFocus = tabKey === OrdinalsAssetTabKey.ALL
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

  const onClickItem = (item: Inscription) => {
    nav.navigate('OrdinalsInscriptionScreen', {
      inscription: item,
      inscriptionId: item.inscriptionId,
    })
  }

  return { items, total, loading, hasMore, onRefresh, onLoadMore, onClickItem }
}
