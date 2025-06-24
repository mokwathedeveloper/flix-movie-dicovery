import { useState, useEffect, useCallback, useRef } from 'react'

const useInfiniteScroll = (fetchMore, hasMore = true, threshold = 100) => {
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState(null)
  const observerRef = useRef()
  const loadingRef = useRef()

  const handleObserver = useCallback((entries) => {
    const [target] = entries
    if (target.isIntersecting && hasMore && !isFetching) {
      setIsFetching(true)
    }
  }, [hasMore, isFetching])

  useEffect(() => {
    const element = loadingRef.current
    const option = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0
    }

    observerRef.current = new IntersectionObserver(handleObserver, option)
    if (element) observerRef.current.observe(element)

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element)
      }
    }
  }, [handleObserver, threshold])

  useEffect(() => {
    if (!isFetching) return

    const fetchData = async () => {
      try {
        setError(null)
        await fetchMore()
      } catch (err) {
        setError(err.message || 'Failed to load more content')
      } finally {
        setIsFetching(false)
      }
    }

    fetchData()
  }, [isFetching, fetchMore])

  return {
    isFetching,
    error,
    loadingRef
  }
}

export default useInfiniteScroll
