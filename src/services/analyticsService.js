class AnalyticsService {
  constructor() {
    this.storageKey = 'flix_analytics'
    this.viewHistoryKey = 'flix_view_history'
    this.searchHistoryKey = 'flix_search_history'
  }

  // Track movie view
  trackMovieView(movie) {
    const viewHistory = this.getViewHistory()
    const view = {
      id: movie.id,
      title: movie.title || movie.name,
      mediaType: movie.media_type || 'movie',
      posterPath: movie.poster_path,
      genres: movie.genre_ids || [],
      rating: movie.vote_average,
      viewedAt: new Date().toISOString(),
      sessionId: this.getSessionId()
    }

    // Remove existing view of same movie
    const filtered = viewHistory.filter(v => !(v.id === movie.id && v.mediaType === view.mediaType))
    
    // Add new view at beginning
    filtered.unshift(view)
    
    // Keep only last 1000 views
    const trimmed = filtered.slice(0, 1000)
    
    localStorage.setItem(this.viewHistoryKey, JSON.stringify(trimmed))
    this.updateAnalytics()
  }

  // Track search query
  trackSearch(query, results = []) {
    const searchHistory = this.getSearchHistory()
    const search = {
      query: query.trim().toLowerCase(),
      resultsCount: results.length,
      searchedAt: new Date().toISOString(),
      sessionId: this.getSessionId()
    }

    searchHistory.unshift(search)
    
    // Keep only last 500 searches
    const trimmed = searchHistory.slice(0, 500)
    
    localStorage.setItem(this.searchHistoryKey, JSON.stringify(trimmed))
  }

  // Get viewing statistics
  getViewingStats() {
    const viewHistory = this.getViewHistory()
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Basic stats
    const totalViews = viewHistory.length
    const uniqueMovies = new Set(viewHistory.map(v => `${v.id}_${v.mediaType}`)).size
    const weeklyViews = viewHistory.filter(v => new Date(v.viewedAt) >= oneWeekAgo).length
    const monthlyViews = viewHistory.filter(v => new Date(v.viewedAt) >= oneMonthAgo).length

    // Genre preferences
    const genreCount = {}
    viewHistory.forEach(view => {
      view.genres?.forEach(genreId => {
        genreCount[genreId] = (genreCount[genreId] || 0) + 1
      })
    })

    const topGenres = Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genreId, count]) => ({ genreId: parseInt(genreId), count }))

    // Media type distribution
    const mediaTypes = viewHistory.reduce((acc, view) => {
      acc[view.mediaType] = (acc[view.mediaType] || 0) + 1
      return acc
    }, {})

    // Viewing patterns by hour
    const hourlyPattern = Array(24).fill(0)
    viewHistory.forEach(view => {
      const hour = new Date(view.viewedAt).getHours()
      hourlyPattern[hour]++
    })

    // Daily pattern for last 30 days
    const dailyPattern = Array(30).fill(0)
    viewHistory.forEach(view => {
      const daysAgo = Math.floor((now - new Date(view.viewedAt)) / (24 * 60 * 60 * 1000))
      if (daysAgo < 30) {
        dailyPattern[29 - daysAgo]++
      }
    })

    // Average rating of viewed content
    const ratingsSum = viewHistory.reduce((sum, view) => sum + (view.rating || 0), 0)
    const averageRating = totalViews > 0 ? ratingsSum / totalViews : 0

    return {
      totalViews,
      uniqueMovies,
      weeklyViews,
      monthlyViews,
      topGenres,
      mediaTypes,
      hourlyPattern,
      dailyPattern,
      averageRating: Math.round(averageRating * 10) / 10,
      mostViewedDay: this.getMostViewedDay(viewHistory),
      viewingStreak: this.getViewingStreak(viewHistory)
    }
  }

  // Get search statistics
  getSearchStats() {
    const searchHistory = this.getSearchHistory()
    
    // Query frequency
    const queryCount = {}
    searchHistory.forEach(search => {
      queryCount[search.query] = (queryCount[search.query] || 0) + 1
    })

    const topQueries = Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }))

    // Search success rate
    const successfulSearches = searchHistory.filter(s => s.resultsCount > 0).length
    const successRate = searchHistory.length > 0 ? (successfulSearches / searchHistory.length) * 100 : 0

    return {
      totalSearches: searchHistory.length,
      uniqueQueries: Object.keys(queryCount).length,
      topQueries,
      successRate: Math.round(successRate),
      averageResults: searchHistory.length > 0 
        ? Math.round(searchHistory.reduce((sum, s) => sum + s.resultsCount, 0) / searchHistory.length)
        : 0
    }
  }

  // Get personalized recommendations
  getRecommendations(allMovies = []) {
    const viewHistory = this.getViewHistory()
    if (viewHistory.length === 0) return []

    // Get user's genre preferences
    const genrePreferences = {}
    viewHistory.forEach(view => {
      view.genres?.forEach(genreId => {
        genrePreferences[genreId] = (genrePreferences[genreId] || 0) + 1
      })
    })

    // Get viewed movie IDs
    const viewedIds = new Set(viewHistory.map(v => `${v.id}_${v.mediaType}`))

    // Score movies based on genre preferences
    const scoredMovies = allMovies
      .filter(movie => !viewedIds.has(`${movie.id}_${movie.media_type || 'movie'}`))
      .map(movie => {
        let score = 0
        
        // Genre matching score
        movie.genre_ids?.forEach(genreId => {
          score += genrePreferences[genreId] || 0
        })
        
        // Rating boost
        score += (movie.vote_average || 0) * 0.1
        
        // Popularity boost
        score += (movie.popularity || 0) * 0.001
        
        return { ...movie, recommendationScore: score }
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 20)

    return scoredMovies
  }

  // Export user data
  exportUserData() {
    const data = {
      viewHistory: this.getViewHistory(),
      searchHistory: this.getSearchHistory(),
      analytics: this.getAnalytics(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    return data
  }

  // Import user data
  importUserData(data) {
    if (data.viewHistory) {
      localStorage.setItem(this.viewHistoryKey, JSON.stringify(data.viewHistory))
    }
    if (data.searchHistory) {
      localStorage.setItem(this.searchHistoryKey, JSON.stringify(data.searchHistory))
    }
    if (data.analytics) {
      localStorage.setItem(this.storageKey, JSON.stringify(data.analytics))
    }
  }

  // Helper methods
  getViewHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.viewHistoryKey) || '[]')
    } catch {
      return []
    }
  }

  getSearchHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.searchHistoryKey) || '[]')
    } catch {
      return []
    }
  }

  getAnalytics() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '{}')
    } catch {
      return {}
    }
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('flix_session_id')
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2)
      sessionStorage.setItem('flix_session_id', sessionId)
    }
    return sessionId
  }

  getMostViewedDay(viewHistory) {
    const dayCount = {}
    viewHistory.forEach(view => {
      const day = new Date(view.viewedAt).toLocaleDateString()
      dayCount[day] = (dayCount[day] || 0) + 1
    })

    const mostViewed = Object.entries(dayCount)
      .sort(([,a], [,b]) => b - a)[0]

    return mostViewed ? { date: mostViewed[0], count: mostViewed[1] } : null
  }

  getViewingStreak(viewHistory) {
    if (viewHistory.length === 0) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let streak = 0
    let currentDate = new Date(today)

    while (true) {
      const dayViews = viewHistory.filter(view => {
        const viewDate = new Date(view.viewedAt)
        viewDate.setHours(0, 0, 0, 0)
        return viewDate.getTime() === currentDate.getTime()
      })

      if (dayViews.length > 0) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  updateAnalytics() {
    const analytics = this.getAnalytics()
    analytics.lastUpdated = new Date().toISOString()
    localStorage.setItem(this.storageKey, JSON.stringify(analytics))
  }

  // Clear all analytics data
  clearAllData() {
    localStorage.removeItem(this.viewHistoryKey)
    localStorage.removeItem(this.searchHistoryKey)
    localStorage.removeItem(this.storageKey)
  }
}

export default new AnalyticsService()
