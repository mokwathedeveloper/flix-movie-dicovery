import React, { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, Heart, Clock, Star, RefreshCw, Settings } from 'lucide-react'
import ContentSection from './ContentSection'
import ErrorBoundary, { SectionErrorFallback } from './ErrorBoundary'
import useRecommendations from '../../hooks/useRecommendations'
import { useWatchlist } from '../../context/WatchlistContext'
import analyticsService from '../../services/analyticsService'
import { getFromStorage, STORAGE_KEYS } from '../../utils/localStorage'

const RecommendationsDashboard = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { recommendations, isLoading, hasPreferences, refreshRecommendations } = useRecommendations()
  const { watchlist, getWatchlistStats } = useWatchlist()
  
  const watchlistStats = getWatchlistStats()
  const userPreferences = getFromStorage(STORAGE_KEYS.USER_PREFERENCES, {})

  // Get analytics data for personalization
  const [viewingStats, setViewingStats] = useState(null)

  useEffect(() => {
    const stats = analyticsService.getViewingStats()
    setViewingStats(stats)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshRecommendations()
    setTimeout(() => setRefreshing(false), 1000)
  }

  // Categorize recommendations based on user behavior
  const categorizeRecommendations = () => {
    if (!recommendations.length) return {}

    const categories = {
      trending: [],
      similar: [],
      genre_based: [],
      new_releases: [],
      highly_rated: []
    }

    recommendations.forEach(item => {
      // Trending items (high popularity)
      if (item.popularity > 50) {
        categories.trending.push(item)
      }

      // Highly rated items
      if (item.vote_average >= 7.5) {
        categories.highly_rated.push(item)
      }

      // New releases (within last year)
      const releaseDate = new Date(item.release_date || item.first_air_date)
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      if (releaseDate > oneYearAgo) {
        categories.new_releases.push(item)
      }

      // Genre-based (based on user's favorite genres)
      if (userPreferences.favoriteGenres?.length > 0 && item.genre_ids) {
        const hasMatchingGenre = item.genre_ids.some(genreId => 
          userPreferences.favoriteGenres.includes(genreId)
        )
        if (hasMatchingGenre) {
          categories.genre_based.push(item)
        }
      }

      // Similar to watchlist items
      if (watchlist.length > 0) {
        categories.similar.push(item)
      }
    })

    return categories
  }

  const categorizedRecommendations = categorizeRecommendations()

  const RecommendationCategory = ({ title, items, icon: Icon, description, color = 'primary' }) => {
    if (!items.length) return null

    const colorClasses = {
      primary: 'text-primary-600',
      green: 'text-green-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600'
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className={`w-6 h-6 ${colorClasses[color]}`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {items.length} items
          </span>
        </div>

        <ContentSection
          items={items.slice(0, 12)}
          isLoading={false}
          showViewAll={items.length > 12}
          className="bg-white dark:bg-dark-100 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        />
      </div>
    )
  }

  const InsightCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
    }

    return (
      <div className="bg-white dark:bg-dark-100 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    )
  }

  if (!hasPreferences) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Build Your Taste Profile
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
          Add movies and TV shows to your watchlist to get personalized recommendations 
          tailored to your preferences.
        </p>
        <button className="btn-primary">
          Explore Content
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Your Recommendations
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Personalized content based on your viewing history and preferences
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InsightCard
          title="Total Recommendations"
          value={recommendations.length}
          subtitle="Curated for you"
          icon={Sparkles}
          color="blue"
        />
        
        <InsightCard
          title="Watchlist Items"
          value={watchlistStats.total}
          subtitle={`${watchlistStats.watched} watched`}
          icon={Heart}
          color="green"
        />
        
        <InsightCard
          title="Viewing Time"
          value={viewingStats?.totalViews || 0}
          subtitle="Movies viewed"
          icon={Clock}
          color="purple"
        />
        
        <InsightCard
          title="Average Rating"
          value={viewingStats?.averageRating?.toFixed(1) || 'N/A'}
          subtitle="Of viewed content"
          icon={Star}
          color="orange"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Recommendations' },
          { key: 'trending', label: 'Trending Now' },
          { key: 'highly_rated', label: 'Highly Rated' },
          { key: 'new_releases', label: 'New Releases' },
          { key: 'genre_based', label: 'Your Genres' },
          { key: 'similar', label: 'Similar to Watchlist' }
        ].map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${selectedCategory === category.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Recommendations */}
      <div className="space-y-8">
        {selectedCategory === 'all' ? (
          <>
            <ErrorBoundary fallback={SectionErrorFallback}>
              <RecommendationCategory
                title="Trending Now"
                items={categorizedRecommendations.trending}
                icon={TrendingUp}
                description="Popular content that's trending right now"
                color="orange"
              />
            </ErrorBoundary>

            <ErrorBoundary fallback={SectionErrorFallback}>
              <RecommendationCategory
                title="Highly Rated"
                items={categorizedRecommendations.highly_rated}
                icon={Star}
                description="Top-rated movies and shows you might love"
                color="green"
              />
            </ErrorBoundary>

            <ErrorBoundary fallback={SectionErrorFallback}>
              <RecommendationCategory
                title="New Releases"
                items={categorizedRecommendations.new_releases}
                icon={Clock}
                description="Recently released content"
                color="blue"
              />
            </ErrorBoundary>

            <ErrorBoundary fallback={SectionErrorFallback}>
              <RecommendationCategory
                title="Based on Your Genres"
                items={categorizedRecommendations.genre_based}
                icon={Heart}
                description="Content matching your favorite genres"
                color="purple"
              />
            </ErrorBoundary>

            <ErrorBoundary fallback={SectionErrorFallback}>
              <RecommendationCategory
                title="Similar to Your Watchlist"
                items={categorizedRecommendations.similar}
                icon={Sparkles}
                description="Content similar to what you've added to your watchlist"
                color="primary"
              />
            </ErrorBoundary>
          </>
        ) : (
          <ErrorBoundary fallback={SectionErrorFallback}>
            <ContentSection
              title={`${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace('_', ' ')} Recommendations`}
              items={categorizedRecommendations[selectedCategory] || []}
              isLoading={isLoading}
              showViewAll={false}
            />
          </ErrorBoundary>
        )}
      </div>

      {/* Empty State */}
      {!isLoading && recommendations.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Recommendations Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            Start by adding some movies and TV shows to your watchlist to get personalized recommendations.
          </p>
          <button
            onClick={handleRefresh}
            className="btn-primary"
          >
            Generate Recommendations
          </button>
        </div>
      )}
    </div>
  )
}

export default RecommendationsDashboard
