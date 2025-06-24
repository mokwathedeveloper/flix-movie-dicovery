import { useState, useEffect, useMemo } from 'react'
import tmdbService from '../services/tmdbService'
import { useWatchlist } from '../context/WatchlistContext'

const useRecommendations = () => {
  const { watchlist } = useWatchlist()
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Analyze user preferences based on watchlist
  const userPreferences = useMemo(() => {
    if (watchlist.length === 0) return null

    const genreCount = {}
    const mediaTypeCount = { movie: 0, tv: 0 }
    let totalRating = 0
    let ratedItems = 0

    watchlist.forEach(item => {
      // Count media types
      mediaTypeCount[item.media_type] = (mediaTypeCount[item.media_type] || 0) + 1

      // Count genres (if available)
      if (item.genre_ids) {
        item.genre_ids.forEach(genreId => {
          genreCount[genreId] = (genreCount[genreId] || 0) + 1
        })
      }

      // Calculate average rating preference
      if (item.vote_average && item.vote_average > 0) {
        totalRating += item.vote_average
        ratedItems++
      }
    })

    // Get top genres (sorted by frequency)
    const topGenres = Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genreId]) => parseInt(genreId))

    // Get preferred media type
    const preferredMediaType = mediaTypeCount.movie >= mediaTypeCount.tv ? 'movie' : 'tv'

    // Get average rating preference
    const averageRating = ratedItems > 0 ? totalRating / ratedItems : 7.0

    return {
      topGenres,
      preferredMediaType,
      averageRating,
      totalItems: watchlist.length
    }
  }, [watchlist])

  // Fetch recommendations based on user preferences
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userPreferences || userPreferences.totalItems === 0) {
        setRecommendations([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const recommendationPromises = []

        // Get recommendations based on top genres
        if (userPreferences.topGenres.length > 0) {
          const topGenre = userPreferences.topGenres[0]
          
          if (userPreferences.preferredMediaType === 'movie') {
            recommendationPromises.push(
              tmdbService.discoverMoviesByGenre(topGenre)
            )
          } else {
            // For TV shows, we'll use popular TV shows and filter by genre later
            recommendationPromises.push(
              tmdbService.getPopularTVShows()
            )
          }
        }

        // Get recommendations based on similar items in watchlist
        const watchedItems = watchlist.slice(0, 3) // Take first 3 items
        watchedItems.forEach(item => {
          if (item.media_type === 'movie') {
            recommendationPromises.push(
              tmdbService.getMovieRecommendations(item.id)
            )
          } else {
            recommendationPromises.push(
              tmdbService.getTVRecommendations(item.id)
            )
          }
        })

        const results = await Promise.allSettled(recommendationPromises)
        
        // Combine all recommendations
        const allRecommendations = []
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value.results) {
            allRecommendations.push(...result.value.results)
          }
        })

        // Remove duplicates and items already in watchlist
        const watchlistIds = new Set(watchlist.map(item => `${item.id}-${item.media_type}`))
        const uniqueRecommendations = allRecommendations.filter((item, index, self) => {
          const itemKey = `${item.id}-${item.media_type || 'movie'}`
          return !watchlistIds.has(itemKey) && 
                 index === self.findIndex(i => `${i.id}-${i.media_type || 'movie'}` === itemKey)
        })

        // Filter by rating preference (show items with rating >= user's average - 1)
        const filteredRecommendations = uniqueRecommendations.filter(item => 
          item.vote_average >= (userPreferences.averageRating - 1)
        )

        // Sort by popularity and rating
        const sortedRecommendations = filteredRecommendations.sort((a, b) => {
          const scoreA = (a.vote_average || 0) * 0.7 + (a.popularity || 0) * 0.3
          const scoreB = (b.vote_average || 0) * 0.7 + (b.popularity || 0) * 0.3
          return scoreB - scoreA
        })

        setRecommendations(sortedRecommendations.slice(0, 20))
      } catch (err) {
        setError(err.message || 'Failed to fetch recommendations')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [userPreferences, watchlist])

  // Get genre-based recommendations
  const getGenreRecommendations = async (genreId, mediaType = 'movie') => {
    try {
      setIsLoading(true)
      setError(null)

      let response
      if (mediaType === 'movie') {
        response = await tmdbService.discoverMoviesByGenre(genreId)
      } else {
        // For TV shows, get popular shows and filter by genre
        response = await tmdbService.getPopularTVShows()
      }

      const filtered = response.results.filter(item => {
        if (mediaType === 'tv' && item.genre_ids) {
          return item.genre_ids.includes(genreId)
        }
        return true
      })

      return filtered.slice(0, 20)
    } catch (err) {
      setError(err.message || 'Failed to fetch genre recommendations')
      return []
    } finally {
      setIsLoading(false)
    }
  }

  return {
    recommendations,
    isLoading,
    error,
    userPreferences,
    getGenreRecommendations,
    hasPreferences: userPreferences && userPreferences.totalItems > 0
  }
}

export default useRecommendations
