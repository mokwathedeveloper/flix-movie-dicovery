import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react'
import MovieCard from './MovieCard'
import { SkeletonCard } from '../common/LoadingSpinner'

const ContentSection = ({ 
  title, 
  items = [], 
  isLoading = false, 
  error = null, 
  onRetry = null,
  className = '',
  showViewAll = false,
  onViewAll = null
}) => {
  const scrollContainerRef = useRef(null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        
        <div className="flex items-center space-x-2">
          {showViewAll && onViewAll && (
            <button
              onClick={onViewAll}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm transition-colors"
            >
              View All
            </button>
          )}
          
          {/* Scroll Controls */}
          {!isLoading && !error && items.length > 0 && (
            <div className="flex space-x-1">
              <button
                onClick={scrollLeft}
                className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="card text-center py-8">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Failed to Load Content
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex-shrink-0">
                  <SkeletonCard className="w-40" />
                </div>
              ))
            ) : (
              // Actual content
              items.slice(0, 20).map((item) => (
                <div key={`${item.id}-${item.media_type || 'movie'}`} className="flex-shrink-0">
                  <MovieCard 
                    movie={item} 
                    size="md"
                    className="w-40"
                  />
                </div>
              ))
            )}
          </div>
          
          {/* Gradient overlays for scroll indication */}
          {!isLoading && !error && items.length > 0 && (
            <>
              <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-gray-50 dark:from-dark-300 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-gray-50 dark:from-dark-300 to-transparent pointer-events-none" />
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Grid version for sections that need grid layout
export const ContentGrid = ({ 
  title, 
  items = [], 
  isLoading = false, 
  error = null, 
  onRetry = null,
  className = '',
  showViewAll = false,
  onViewAll = null,
  columns = 6
}) => {
  const gridCols = {
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm transition-colors"
          >
            View All
          </button>
        )}
      </div>

      {/* Content */}
      {error ? (
        <div className="card text-center py-8">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Failed to Load Content
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      ) : (
        <div className={`grid ${gridCols[columns]} gap-4`}>
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: columns * 2 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : (
            // Actual content
            items.slice(0, columns * 2).map((item) => (
              <MovieCard 
                key={`${item.id}-${item.media_type || 'movie'}`}
                movie={item} 
                size="md"
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default ContentSection
