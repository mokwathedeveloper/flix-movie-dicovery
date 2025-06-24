import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MovieCard from './MovieCard'
import TrailerModal from './TrailerModal'
import useKeyboardNavigation from '../../hooks/useKeyboardNavigation'
import useInfiniteScroll from '../../hooks/useInfiniteScroll'
import tmdbService from '../../services/tmdbService'
import { Loader2, Play } from 'lucide-react'

const EnhancedMovieGrid = ({ 
  movies = [], 
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className = '',
  enableKeyboardNav = true,
  enableInfiniteScroll = true,
  gridColumns = 4
}) => {
  const navigate = useNavigate()
  const [trailerModal, setTrailerModal] = useState({ isOpen: false, videoKey: null, title: '' })
  const [loadingTrailer, setLoadingTrailer] = useState(null)

  // Keyboard navigation
  const { selectedIndex, isActive, activate, deactivate, isSelected } = useKeyboardNavigation(
    movies,
    (movie) => navigate(`/${movie.media_type || 'movie'}/${movie.id}`),
    gridColumns
  )

  // Infinite scroll
  const { isFetching, error, loadingRef } = useInfiniteScroll(
    onLoadMore,
    hasMore && enableInfiniteScroll
  )

  // Handle movie click
  const handleMovieClick = useCallback((movie) => {
    navigate(`/${movie.media_type || 'movie'}/${movie.id}`)
  }, [navigate])

  // Handle trailer play
  const handleTrailerPlay = useCallback(async (movie, event) => {
    event.preventDefault()
    event.stopPropagation()
    
    setLoadingTrailer(movie.id)
    
    try {
      const mediaType = movie.media_type || 'movie'
      const videos = mediaType === 'movie' 
        ? await tmdbService.getMovieVideos(movie.id)
        : await tmdbService.getTVVideos(movie.id)
      
      // Find the best trailer
      const trailer = videos.results?.find(video => 
        video.type === 'Trailer' && video.site === 'YouTube'
      ) || videos.results?.find(video => 
        video.site === 'YouTube'
      )
      
      if (trailer) {
        setTrailerModal({
          isOpen: true,
          videoKey: trailer.key,
          title: movie.title || movie.name
        })
      } else {
        console.log('No trailer available for this movie')
      }
    } catch (error) {
      console.error('Failed to load trailer:', error)
    } finally {
      setLoadingTrailer(null)
    }
  }, [])

  // Activate keyboard navigation on focus
  useEffect(() => {
    if (enableKeyboardNav) {
      const handleFocus = () => activate()
      const handleBlur = () => deactivate()
      
      window.addEventListener('focus', handleFocus)
      window.addEventListener('blur', handleBlur)
      
      return () => {
        window.removeEventListener('focus', handleFocus)
        window.removeEventListener('blur', handleBlur)
      }
    }
  }, [enableKeyboardNav, activate, deactivate])

  if (!movies.length && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <Play className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No movies found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Movie Grid */}
      <div 
        className={`grid gap-6 ${
          gridColumns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
          gridColumns === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
          gridColumns === 5 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}
        tabIndex={enableKeyboardNav ? 0 : -1}
        onFocus={enableKeyboardNav ? activate : undefined}
      >
        {movies.map((movie, index) => (
          <div
            key={`${movie.id}-${movie.media_type || 'movie'}`}
            data-keyboard-nav-index={index}
            className={`
              relative transition-all duration-200
              ${isSelected(index) ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-dark-100' : ''}
            `}
          >
            <MovieCard
              movie={movie}
              onClick={() => handleMovieClick(movie)}
              className="h-full"
            />
            
            {/* Trailer Play Button Overlay */}
            <button
              onClick={(e) => handleTrailerPlay(movie, e)}
              disabled={loadingTrailer === movie.id}
              className="
                absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-200
                flex items-center justify-center opacity-0 hover:opacity-100
                rounded-2xl
              "
              aria-label={`Play ${movie.title || movie.name} trailer`}
            >
              {loadingTrailer === movie.id ? (
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              ) : (
                <div className="bg-black/70 backdrop-blur-sm rounded-full p-4">
                  <Play className="w-8 h-8 text-white fill-current" />
                </div>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading movies...</span>
          </div>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {enableInfiniteScroll && hasMore && (
        <div ref={loadingRef} className="flex justify-center py-4">
          {isFetching && (
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more...</span>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Keyboard Navigation Hint */}
      {enableKeyboardNav && isActive && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-sm px-3 py-2 rounded-lg backdrop-blur-sm">
          Use arrow keys to navigate, Enter to select, Esc to exit
        </div>
      )}

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={() => setTrailerModal({ isOpen: false, videoKey: null, title: '' })}
        videoKey={trailerModal.videoKey}
        title={trailerModal.title}
      />
    </div>
  )
}

export default EnhancedMovieGrid
