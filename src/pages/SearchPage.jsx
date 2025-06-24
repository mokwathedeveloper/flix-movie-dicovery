import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, Grid, List, AlertCircle } from 'lucide-react'
import SearchBar from '../components/ui/SearchBar'
import MovieCard from '../components/ui/MovieCard'
import EnhancedMovieGrid from '../components/ui/EnhancedMovieGrid'
import GenreFilter, { GenreFilterInline } from '../components/ui/GenreFilter'
import AdvancedFilters from '../components/ui/AdvancedFilters'
import ErrorBoundary, { SectionErrorFallback } from '../components/ui/ErrorBoundary'
import LoadingSpinner, { SkeletonGrid } from '../components/common/LoadingSpinner'
import useSearch from '../hooks/useSearch'
import useGenres from '../hooks/useGenres'
import analyticsService from '../services/analyticsService'

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [filterType, setFilterType] = useState('all') // 'all', 'movie', 'tv'
  const [selectedGenres, setSelectedGenres] = useState([])
  const [advancedFilters, setAdvancedFilters] = useState({})
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const initialQuery = searchParams.get('q') || ''
  const { getGenreNames } = useGenres()
  const {
    query,
    results,
    isLoading,
    error,
    hasSearched,
    totalResults,
    search,
    loadMore,
    hasMore
  } = useSearch(initialQuery)

  // Update URL when search query changes
  useEffect(() => {
    if (query) {
      setSearchParams({ q: query })
    } else {
      setSearchParams({})
    }
  }, [query, setSearchParams])

  // Filter results based on media type, genres, and advanced filters
  const filteredResults = results.filter(item => {
    // Filter by media type
    if (filterType !== 'all' && item.media_type !== filterType) {
      return false
    }

    // Filter by genres
    if (selectedGenres.length > 0 && item.genre_ids) {
      if (!selectedGenres.some(genreId => item.genre_ids.includes(genreId))) {
        return false
      }
    }

    // Filter by year range
    if (advancedFilters.yearRange) {
      const releaseDate = item.release_date || item.first_air_date
      if (releaseDate) {
        const year = new Date(releaseDate).getFullYear()
        if (year < advancedFilters.yearRange.min || year > advancedFilters.yearRange.max) {
          return false
        }
      }
    }

    // Filter by rating range
    if (advancedFilters.ratingRange && item.vote_average) {
      if (item.vote_average < advancedFilters.ratingRange.min ||
          item.vote_average > advancedFilters.ratingRange.max) {
        return false
      }
    }

    return true
  })

  const handleSearch = (searchQuery) => {
    // Track search for analytics
    analyticsService.trackSearch(searchQuery)
    search(searchQuery)
  }

  const handleFilterChange = (type) => {
    setFilterType(type)
  }

  const handleGenreChange = (genres) => {
    setSelectedGenres(genres)
  }

  const handleAdvancedFiltersChange = (filters) => {
    setAdvancedFilters(filters)
  }

  const handleLoadMore = () => {
    loadMore()
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Search Movies & TV Shows
        </h1>
        <div className="max-w-2xl mx-auto">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search for movies, TV shows, actors..."
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-6">
          {/* Active Filters Display */}
          {(selectedGenres.length > 0 || Object.keys(advancedFilters).length > 0) && (
            <div className="bg-gray-50 dark:bg-dark-100 rounded-lg p-4 space-y-3">
              <GenreFilterInline
                selectedGenres={selectedGenres}
                onGenreChange={handleGenreChange}
                mediaType={filterType}
                maxVisible={4}
              />
            </div>
          )}

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {error ? 'Search Error' : `Search Results`}
              </h2>
              {!error && totalResults > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {totalResults.toLocaleString()} results found
                  {filteredResults.length !== totalResults && (
                    <span className="ml-1">
                      ({filteredResults.length} after filters)
                    </span>
                  )}
                </span>
              )}
            </div>

            {!error && filteredResults.length > 0 && (
              <div className="flex flex-wrap items-center gap-4">
                {/* Filter Buttons */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'movie', label: 'Movies' },
                      { key: 'tv', label: 'TV Shows' }
                    ].map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => handleFilterChange(filter.key)}
                        className={`
                          px-3 py-2 text-sm font-medium transition-colors
                          ${filterType === filter.key
                            ? 'bg-primary-600 text-white'
                            : 'bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100'
                          }
                        `}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Genre Filter */}
                <GenreFilter
                  selectedGenres={selectedGenres}
                  onGenreChange={handleGenreChange}
                  mediaType={filterType}
                />

                {/* Advanced Filters */}
                <AdvancedFilters
                  filters={advancedFilters}
                  onFiltersChange={handleAdvancedFiltersChange}
                  isOpen={showAdvancedFilters}
                  onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
                />

                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden ml-auto">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`
                      p-2 transition-colors
                      ${viewMode === 'grid'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100'
                      }
                    `}
                    aria-label="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`
                      p-2 transition-colors
                      ${viewMode === 'list'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100'
                      }
                    `}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="card text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Search Failed
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <button
                onClick={() => handleSearch(query)}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Results */}
          {!error && !isLoading && hasSearched && filteredResults.length === 0 && (
            <div className="card text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Results Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {query ? `No results found for "${query}"` : 'Try searching for something else'}
              </p>
            </div>
          )}

          {/* Results Grid/List */}
          {!error && filteredResults.length > 0 && (
            <div className="space-y-6">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredResults.map((item) => (
                    <MovieCard
                      key={`${item.id}-${item.media_type}`}
                      movie={item}
                      size="md"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResults.map((item) => (
                    <MovieCard
                      key={`${item.id}-${item.media_type}`}
                      movie={item}
                      className="w-full"
                    />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <LoadingSpinner size="sm" showText={false} />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && filteredResults.length === 0 && (
            <SkeletonGrid count={12} />
          )}
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && !isLoading && (
        <div className="card text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Start Your Search
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Search for your favorite movies, TV shows, or discover something new.
            Use the search bar above to get started.
          </p>
        </div>
      )}
    </div>
  )
}

export default SearchPage
