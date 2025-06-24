import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Eye, Search, Calendar, Clock, Download, Upload } from 'lucide-react'
import analyticsService from '../../services/analyticsService'
import exportService from '../../services/exportService'

const AnalyticsDashboard = () => {
  const [viewingStats, setViewingStats] = useState(null)
  const [searchStats, setSearchStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = () => {
    setLoading(true)
    try {
      const viewing = analyticsService.getViewingStats()
      const search = analyticsService.getSearchStats()
      setViewingStats(viewing)
      setSearchStats(search)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportAnalytics = () => {
    const data = {
      viewingStats,
      searchStats,
      viewHistory: analyticsService.getViewHistory(),
      searchHistory: analyticsService.getSearchHistory()
    }
    exportService.exportAnalytics(data)
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
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

  const ChartBar = ({ label, value, maxValue, color = 'blue' }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
    
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500'
    }

    return (
      <div className="flex items-center space-x-3">
        <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
          {label}
        </div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${colorClasses[color]} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="w-8 text-sm text-gray-600 dark:text-gray-400">
          {value}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!viewingStats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Analytics Data
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start watching movies to see your analytics!
        </p>
      </div>
    )
  }

  const maxHourlyViews = Math.max(...viewingStats.hourlyPattern)
  const maxDailyViews = Math.max(...viewingStats.dailyPattern)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Your Analytics
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Insights into your movie watching habits
          </p>
        </div>
        <button
          onClick={handleExportAnalytics}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Views"
          value={viewingStats.totalViews}
          subtitle="All time"
          icon={Eye}
          color="blue"
        />
        <StatCard
          title="Unique Movies"
          value={viewingStats.uniqueMovies}
          subtitle="Different titles"
          icon={BarChart3}
          color="green"
        />
        <StatCard
          title="This Week"
          value={viewingStats.weeklyViews}
          subtitle="Views this week"
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Viewing Streak"
          value={`${viewingStats.viewingStreak} days`}
          subtitle="Current streak"
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Pattern */}
        <div className="bg-white dark:bg-dark-100 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Viewing by Hour
          </h3>
          <div className="space-y-2">
            {viewingStats.hourlyPattern.map((views, hour) => (
              <ChartBar
                key={hour}
                label={`${hour}:00`}
                value={views}
                maxValue={maxHourlyViews}
                color="blue"
              />
            )).filter((_, hour) => viewingStats.hourlyPattern[hour] > 0)}
          </div>
        </div>

        {/* Media Type Distribution */}
        <div className="bg-white dark:bg-dark-100 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Content Type Preferences
          </h3>
          <div className="space-y-3">
            {Object.entries(viewingStats.mediaTypes).map(([type, count]) => (
              <ChartBar
                key={type}
                label={type === 'tv' ? 'TV Shows' : 'Movies'}
                value={count}
                maxValue={Math.max(...Object.values(viewingStats.mediaTypes))}
                color={type === 'tv' ? 'purple' : 'green'}
              />
            ))}
          </div>
        </div>

        {/* Top Genres */}
        <div className="bg-white dark:bg-dark-100 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Favorite Genres
          </h3>
          <div className="space-y-3">
            {viewingStats.topGenres.map((genre, index) => (
              <ChartBar
                key={genre.genreId}
                label={`Genre ${genre.genreId}`}
                value={genre.count}
                maxValue={viewingStats.topGenres[0]?.count || 1}
                color={['blue', 'green', 'purple', 'orange'][index % 4]}
              />
            ))}
          </div>
        </div>

        {/* Search Stats */}
        <div className="bg-white dark:bg-dark-100 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Searches</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {searchStats.totalSearches}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {searchStats.successRate}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg Results</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {searchStats.averageResults}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Activity (Last 30 Days) */}
      <div className="bg-white dark:bg-dark-100 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Daily Activity (Last 30 Days)
        </h3>
        <div className="grid grid-cols-30 gap-1">
          {viewingStats.dailyPattern.map((views, index) => {
            const intensity = maxDailyViews > 0 ? views / maxDailyViews : 0
            const opacity = Math.max(0.1, intensity)
            
            return (
              <div
                key={index}
                className="w-3 h-3 rounded-sm bg-primary-500"
                style={{ opacity }}
                title={`${views} views`}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-100 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {viewingStats.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Average Rating of Viewed Content
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-100 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {viewingStats.monthlyViews}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Views This Month
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-100 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {searchStats.uniqueQueries}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Unique Search Queries
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
