import { AlkanesInfo } from '@unisat/wallet-shared'

import { getSupportedAssets, useChainType, useCurrentAccount, useNavigation, useWallet } from '..'
import { useInfiniteList } from './useInfiniteList'

export function useAlkanesNFTListLogic(collectionId: string) {
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
  } = useInfiniteList<AlkanesInfo>({
    fetcher: async (page, pageSize) => {
      const supportedAssets = getSupportedAssets(chainType, currentAccount.address)
      if (!supportedAssets.assets.alkanes || currentAccount.address === '') {
        return { list: [], total: 0 }
      }
      const { list, total } = await wallet.getAlkanesCollectionItems(
        currentAccount.address,
        collectionId,
        page,
        pageSize
      )

      return { list, total }
    },
    dependencies: [currentAccount.address, collectionId, chainType],
  })

  const onClickItem = (item: AlkanesInfo) => {
    nav.navigate('AlkanesNFTScreen', { alkanesInfo: item })
  }

  return { items, total, loading, hasMore, onRefresh, onLoadMore, onClickItem }
}
