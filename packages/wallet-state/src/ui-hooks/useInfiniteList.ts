import { useCallback, useEffect, useState } from 'react'

interface UseInfiniteListOptions<T> {
  fetcher: (page: number, pageSize: number) => Promise<{ list: T[]; total: number }>
  pageSize?: number
  dependencies?: any[]
}

export function useInfiniteList<T>({
  fetcher,
  pageSize = 20,
  dependencies = [],
}: UseInfiniteListOptions<T>) {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (loading) return
      setLoading(true)
      try {
        const pageToLoad = isRefresh ? 1 : page
        const { list, total } = await fetcher(pageToLoad, pageSize)

        setTotal(total)
        setData(prev => (isRefresh ? list : [...prev, ...list]))

        const loadedCount = (pageToLoad - 1) * pageSize + list.length
        setHasMore(loadedCount < total)

        setPage(isRefresh ? 2 : page + 1)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    },
    [fetcher, page, pageSize, loading]
  )

  const onRefresh = () => loadData(true)
  const onLoadMore = () => {
    if (hasMore && !loading) loadData(false)
  }

  useEffect(() => {
    setData([])
    setPage(1)
    setHasMore(true)

    loadData(true)
  }, dependencies)

  return {
    data,
    total,
    loading,
    hasMore,
    page,
    onRefresh,
    onLoadMore,
  }
}
