import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import MovieCard from './MovieCard'
import tmdbService from '../../services/tmdbService'

const SimilarContent = ({ movieId, tvId, mediaType = 'movie', title = "Similar Content" }) => {
  const [similarContent, setSimilarContent] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('similar')

  const contentId = mediaType === 'movie' ? movieId : tvId

  useEffect(() => {
    if (contentId) {
      loadSimilarContent()
    }
  }, [contentId, mediaType])

  const loadSimilarContent = async () => {
    try {
      setLoading(true)
      setError(null)

      const [similarData, recommendationsData] = await Promise.all([
        mediaType === 'movie' 
          ? tmdbService.getSimilarMovies(contentId)
          : tmdbService.getSimilarTVShows(contentId),
        mediaType === 'movie'
          ? tmdbService.getMovieRecommendations(contentId)
          : tmdbService.getTVRecommendations(contentId)
      ])

      setSimilarContent(similarData.results || [])
      setRecommendations(recommendationsData.results || [])
    } catch (err) {
      setError('Failed to load similar content')
      console.error('Error loading similar content:', err)
    } finally {
      setLoading(false)
    }
  }

  const ScrollableRow = ({ items, emptyMessage }) => {
    const [scrollPosition, setScrollPosition] = useState(0)
    const containerRef = React.useRef(null)

    const scroll = (direction) => {
      const container = containerRef.current
      if (!container) return

      const cardWidth = 200 // Approximate card width
      const scrollAmount = cardWidth * 3 // Scroll 3 cards at a time
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount)

      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }

    const canScrollLeft = scrollPosition > 0
    const canScrollRight = containerRef.current 
      ? scrollPosition < containerRef.current.scrollWidth - containerRef.current.clientWidth
      : false

    if (!items.length) {
      return (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      )
    }

    return (
      <div className="relative">
        {/* Scroll Controls */}
        {items.length > 4 && (
          <>
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full shadow-lg transition-all ${
                canScrollLeft
                  ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full shadow-lg transition-all ${
                canScrollRight
                  ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Content Row */}
        <div
          ref={containerRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-48">
              <MovieCard
                movie={{ ...item, media_type: mediaType }}
                size="sm"
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <div className="animate-pulse">
          <div className="flex space-x-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48">
                <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    )
  }

  const hasContent = similarContent.length > 0 || recommendations.length > 0

  if (!hasContent) {
    return (
      <div className="text-center py-8">
        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          No similar content found
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Sparkles className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      </div>

      {/* Tabs */}
      {similarContent.length > 0 && recommendations.length > 0 && (
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('similar')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'similar'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Similar ({similarContent.length})
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'recommendations'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Recommended ({recommendations.length})
          </button>
        </div>
      )}

      {/* Content */}
      {activeTab === 'similar' && similarContent.length > 0 && (
        <ScrollableRow
          items={similarContent}
          emptyMessage="No similar content found"
        />
      )}

      {activeTab === 'recommendations' && recommendations.length > 0 && (
        <ScrollableRow
          items={recommendations}
          emptyMessage="No recommendations available"
        />
      )}

      {/* Single section when only one type is available */}
      {similarContent.length > 0 && recommendations.length === 0 && activeTab === 'similar' && (
        <ScrollableRow
          items={similarContent}
          emptyMessage="No similar content found"
        />
      )}

      {recommendations.length > 0 && similarContent.length === 0 && activeTab === 'recommendations' && (
        <ScrollableRow
          items={recommendations}
          emptyMessage="No recommendations available"
        />
      )}
    </div>
  )
}

export default SimilarContent
