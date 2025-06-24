import { useState, useEffect, useCallback } from 'react'
import tmdbService from '../services/tmdbService'
import { debounce } from '../utils/debounce'

const useSearch = (initialQuery = '', debounceDelay = 500) => {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery, page = 1) => {
      if (!searchQuery.trim()) {
        setResults([])
        setError(null)
        setHasSearched(false)
        setTotalResults(0)
        setTotalPages(0)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await tmdbService.searchMulti(searchQuery.trim(), page)
        
        if (page === 1) {
          setResults(response.results || [])
        } else {
          setResults(prev => [...prev, ...(response.results || [])])
        }
        
        setTotalResults(response.total_results || 0)
        setTotalPages(response.total_pages || 0)
        setCurrentPage(page)
        setHasSearched(true)
      } catch (err) {
        setError(err.message || 'Failed to search. Please try again.')
        if (page === 1) {
          setResults([])
          setTotalResults(0)
          setTotalPages(0)
        }
      } finally {
        setIsLoading(false)
      }
    }, debounceDelay),
    [debounceDelay]
  )

  // Search function
  const search = useCallback((searchQuery, page = 1) => {
    setQuery(searchQuery)
    debouncedSearch(searchQuery, page)
  }, [debouncedSearch])

  // Load more results
  const loadMore = useCallback(() => {
    if (currentPage < totalPages && !isLoading) {
      debouncedSearch(query, currentPage + 1)
    }
  }, [query, currentPage, totalPages, isLoading, debouncedSearch])

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setError(null)
    setHasSearched(false)
    setTotalResults(0)
    setTotalPages(0)
    setCurrentPage(1)
  }, [])

  // Effect to handle initial query
  useEffect(() => {
    if (initialQuery) {
      search(initialQuery)
    }
  }, [initialQuery, search])

  return {
    query,
    results,
    isLoading,
    error,
    hasSearched,
    totalResults,
    currentPage,
    totalPages,
    search,
    loadMore,
    clearSearch,
    hasMore: currentPage < totalPages
  }
}

export default useSearch
