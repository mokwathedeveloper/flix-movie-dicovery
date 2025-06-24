import React from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Star, Clock } from 'lucide-react'
import ContentSection from '../components/ui/ContentSection'
import SearchBar from '../components/ui/SearchBar'
import PWAInstall from '../components/ui/PWAInstall'
import ErrorBoundary, { SectionErrorFallback } from '../components/ui/ErrorBoundary'
import useTrending from '../hooks/useTrending'
import useRecommendations from '../hooks/useRecommendations'
import { useWatchlist } from '../context/WatchlistContext'
import analyticsService from '../services/analyticsService'

const HomePage = () => {
  const navigate = useNavigate()
  const { data, loading, errors, retry } = useTrending()
  const { recommendations, isLoading: recommendationsLoading, hasPreferences } = useRecommendations()
  const { getWatchlistStats } = useWatchlist()

  const watchlistStats = getWatchlistStats()

  const handleSearch = (query) => {
    if (query.trim()) {
      // Track search for analytics
      analyticsService.trackSearch(query.trim())
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleViewAll = (section) => {
    // Navigate to search page with appropriate filters
    navigate('/search')
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100">
            Welcome to <span className="text-primary-600">Flix</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover amazing movies and TV shows, create your personal watchlist, and never miss out on great content.
          </p>
        </div>

        {/* Hero Search */}
        <div className="max-w-2xl mx-auto">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search for movies, TV shows, actors..."
            className="shadow-lg"
          />
        </div>

        {/* Quick Stats */}
        {watchlistStats.total > 0 && (
          <div className="flex justify-center">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl px-6 py-3">
              <p className="text-primary-700 dark:text-primary-300 font-medium">
                You have <span className="font-bold">{watchlistStats.total}</span> items in your watchlist
              </p>
            </div>
          </div>
        )}
      </div>

      {/* PWA Install Prompt */}
      <ErrorBoundary fallback={() => null}>
        <PWAInstall />
      </ErrorBoundary>

      {/* Recommendations */}
      {hasPreferences && (
        <ErrorBoundary fallback={SectionErrorFallback}>
          <ContentSection
            title="Recommended for You"
            items={recommendations}
            isLoading={recommendationsLoading}
            showViewAll
            onViewAll={() => handleViewAll('recommendations')}
          />
        </ErrorBoundary>
      )}

      {/* Trending Today */}
      <ErrorBoundary fallback={SectionErrorFallback}>
        <ContentSection
          title="Trending Today"
          items={data.trending}
          isLoading={loading.trending}
          error={errors.trending}
          onRetry={() => retry('trending')}
          showViewAll
          onViewAll={() => handleViewAll('trending')}
        />
      </ErrorBoundary>

      {/* Popular Movies */}
      <ErrorBoundary fallback={SectionErrorFallback}>
        <ContentSection
          title="Popular Movies"
          items={data.popularMovies}
          isLoading={loading.popularMovies}
          error={errors.popularMovies}
          onRetry={() => retry('popularMovies')}
          showViewAll
          onViewAll={() => handleViewAll('popularMovies')}
        />
      </ErrorBoundary>

      {/* Popular TV Shows */}
      <ContentSection
        title="Popular TV Shows"
        items={data.popularTVShows}
        isLoading={loading.popularTVShows}
        error={errors.popularTVShows}
        onRetry={() => retry('popularTVShows')}
        showViewAll
        onViewAll={() => handleViewAll('popularTVShows')}
      />

      {/* Top Rated Movies */}
      <ContentSection
        title="Top Rated Movies"
        items={data.topRatedMovies}
        isLoading={loading.topRatedMovies}
        error={errors.topRatedMovies}
        onRetry={() => retry('topRatedMovies')}
        showViewAll
        onViewAll={() => handleViewAll('topRatedMovies')}
      />

      {/* Upcoming Movies */}
      <ContentSection
        title="Coming Soon"
        items={data.upcomingMovies}
        isLoading={loading.upcomingMovies}
        error={errors.upcomingMovies}
        onRetry={() => retry('upcomingMovies')}
        showViewAll
        onViewAll={() => handleViewAll('upcomingMovies')}
      />


    </div>
  )
}

export default HomePage
