import React from 'react'
import { Loader2, Film, Search, Bookmark } from 'lucide-react'

// Page-level loading component
export const PageLoading = ({ message = "Loading...", icon: Icon = Film }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
    <div className="relative">
      <Icon className="w-12 h-12 text-primary-600 dark:text-primary-400" />
      <Loader2 className="w-6 h-6 text-primary-600 dark:text-primary-400 animate-spin absolute -top-1 -right-1" />
    </div>
    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
      {message}
    </p>
  </div>
)

// Search loading component
export const SearchLoading = () => (
  <PageLoading 
    message="Searching for content..." 
    icon={Search}
  />
)

// Watchlist loading component
export const WatchlistLoading = () => (
  <PageLoading 
    message="Loading your watchlist..." 
    icon={Bookmark}
  />
)

// Content section loading with skeletons
export const ContentSectionLoading = ({ title, itemCount = 8 }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 animate-pulse"></div>
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
    </div>
    
    <div className="flex space-x-4 overflow-hidden">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index} className="flex-shrink-0 w-40">
          <div className="aspect-[2/3] bg-gray-300 dark:bg-gray-600 rounded-2xl animate-pulse mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Movie detail loading skeleton
export const MovieDetailLoading = () => (
  <div className="space-y-8 animate-pulse">
    {/* Back button skeleton */}
    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
    
    {/* Hero section skeleton */}
    <div className="h-64 md:h-80 lg:h-96 bg-gray-300 dark:bg-gray-600 rounded-2xl"></div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Poster skeleton */}
      <div className="lg:col-span-1">
        <div className="aspect-[2/3] bg-gray-300 dark:bg-gray-600 rounded-2xl mb-6"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
      
      {/* Details skeleton */}
      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-4">
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          <div className="flex space-x-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-18"></div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="text-center">
                <div className="aspect-square bg-gray-300 dark:bg-gray-600 rounded-full mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Grid loading skeleton
export const GridLoading = ({ itemCount = 12, columns = 6 }) => {
  const gridCols = {
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[2/3] bg-gray-300 dark:bg-gray-600 rounded-2xl mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// List loading skeleton
export const ListLoading = ({ itemCount = 8 }) => (
  <div className="space-y-4">
    {Array.from({ length: itemCount }).map((_, index) => (
      <div key={index} className="flex space-x-4 p-4 bg-white dark:bg-dark-100 rounded-lg animate-pulse">
        <div className="w-16 h-24 bg-gray-300 dark:bg-gray-600 rounded-lg flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
        </div>
        <div className="flex flex-col justify-between py-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Inline loading spinner for buttons
export const ButtonLoading = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin`} />
  )
}

// Loading overlay for forms or sections
export const LoadingOverlay = ({ message = "Loading...", transparent = false }) => (
  <div className={`absolute inset-0 flex items-center justify-center z-50 ${
    transparent ? 'bg-white/70 dark:bg-dark-300/70' : 'bg-white dark:bg-dark-300'
  } backdrop-blur-sm`}>
    <div className="flex flex-col items-center space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
      <p className="text-gray-600 dark:text-gray-400 font-medium">
        {message}
      </p>
    </div>
  </div>
)

export default {
  PageLoading,
  SearchLoading,
  WatchlistLoading,
  ContentSectionLoading,
  MovieDetailLoading,
  GridLoading,
  ListLoading,
  ButtonLoading,
  LoadingOverlay
}
