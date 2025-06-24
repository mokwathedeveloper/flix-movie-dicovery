import { tmdbApi } from './api'
import cacheService from './cacheService'

class TMDBService {
  // Helper method to make cached API calls
  async cachedApiCall(endpoint, params = {}, ttl = 5 * 60 * 1000) {
    const cacheKey = cacheService.generateKey(endpoint, params)
    const cachedData = cacheService.get(cacheKey)

    if (cachedData) {
      console.log('Cache hit for:', endpoint)
      return cachedData
    }

    try {
      console.log('Cache miss, fetching:', endpoint)
      const response = await tmdbApi.get(endpoint, { params })
      cacheService.set(cacheKey, response.data, ttl)
      return response.data
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  }
  // Search movies and TV shows
  async searchMulti(query, page = 1) {
    try {
      return await this.cachedApiCall('/search/multi', { query, page }, 2 * 60 * 1000) // 2 min cache for search
    } catch (error) {
      throw new Error('Failed to search content')
    }
  }

  // Get trending content
  async getTrending(mediaType = 'all', timeWindow = 'day', page = 1) {
    try {
      return await this.cachedApiCall(`/trending/${mediaType}/${timeWindow}`, { page }, 10 * 60 * 1000) // 10 min cache
    } catch (error) {
      throw new Error('Failed to fetch trending content')
    }
  }

  // Get popular movies
  async getPopularMovies(page = 1) {
    try {
      const response = await tmdbApi.get('/movie/popular', {
        params: { page }
      })
      return response.data
    } catch (error) {
      console.error('TMDB API Error:', error.response?.data || error.message)
      // Return mock data for demo purposes
      return {
        page: 1,
        results: [
          {
            id: 3,
            title: "Popular Demo Movie 1",
            overview: "This is a popular demo movie while we fix the API connection.",
            poster_path: null,
            backdrop_path: null,
            release_date: "2024-01-01",
            vote_average: 9.0,
            genre_ids: [28, 12]
          },
          {
            id: 4,
            title: "Popular Demo Movie 2",
            overview: "Another popular demo movie for testing purposes.",
            poster_path: null,
            backdrop_path: null,
            release_date: "2024-01-02",
            vote_average: 8.7,
            genre_ids: [35, 18]
          }
        ],
        total_pages: 1,
        total_results: 2
      }
    }
  }

  // Get popular TV shows
  async getPopularTVShows(page = 1) {
    try {
      const response = await tmdbApi.get('/tv/popular', {
        params: { page }
      })
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch popular TV shows')
    }
  }

  // Get top rated movies
  async getTopRatedMovies(page = 1) {
    try {
      const response = await tmdbApi.get('/movie/top_rated', {
        params: { page }
      })
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch top rated movies')
    }
  }

  // Get upcoming movies
  async getUpcomingMovies(page = 1) {
    try {
      const response = await tmdbApi.get('/movie/upcoming', {
        params: { page }
      })
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch upcoming movies')
    }
  }

  // Get movie details
  async getMovieDetails(movieId) {
    try {
      const response = await tmdbApi.get(`/movie/${movieId}`, {
        params: { append_to_response: 'credits,videos,similar' }
      })
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch movie details')
    }
  }

  // Get TV show details
  async getTVShowDetails(tvId) {
    try {
      const response = await tmdbApi.get(`/tv/${tvId}`, {
        params: { append_to_response: 'credits,videos,similar' }
      })
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch TV show details')
    }
  }

  // Get genres
  async getMovieGenres() {
    try {
      const response = await tmdbApi.get('/genre/movie/list')
      return response.data.genres
    } catch (error) {
      throw new Error('Failed to fetch movie genres')
    }
  }

  async getTVGenres() {
    try {
      const response = await tmdbApi.get('/genre/tv/list')
      return response.data.genres
    } catch (error) {
      throw new Error('Failed to fetch TV genres')
    }
  }

  // Discover movies by genre
  async discoverMoviesByGenre(genreId, page = 1) {
    try {
      const response = await tmdbApi.get('/discover/movie', {
        params: { 
          with_genres: genreId,
          page,
          sort_by: 'popularity.desc'
        }
      })
      return response.data
    } catch (error) {
      throw new Error('Failed to discover movies by genre')
    }
  }

  // Get recommendations
  async getMovieRecommendations(movieId, page = 1) {
    try {
      const response = await tmdbApi.get(`/movie/${movieId}/recommendations`, {
        params: { page }
      })
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch movie recommendations')
    }
  }

  async getTVRecommendations(tvId, page = 1) {
    try {
      const response = await tmdbApi.get(`/tv/${tvId}/recommendations`, {
        params: { page }
      })
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch TV recommendations')
    }
  }

  // Get movie videos (trailers, teasers, etc.)
  async getMovieVideos(movieId) {
    try {
      return await this.cachedApiCall(`/movie/${movieId}/videos`, {}, 30 * 60 * 1000) // 30 min cache
    } catch (error) {
      throw new Error('Failed to fetch movie videos')
    }
  }

  // Get TV show videos
  async getTVVideos(tvId) {
    try {
      return await this.cachedApiCall(`/tv/${tvId}/videos`, {}, 30 * 60 * 1000) // 30 min cache
    } catch (error) {
      throw new Error('Failed to fetch TV videos')
    }
  }

  // Get watch providers
  async getMovieWatchProviders(movieId) {
    try {
      return await this.cachedApiCall(`/movie/${movieId}/watch/providers`, {}, 60 * 60 * 1000) // 1 hour cache
    } catch (error) {
      throw new Error('Failed to fetch watch providers')
    }
  }

  async getTVWatchProviders(tvId) {
    try {
      return await this.cachedApiCall(`/tv/${tvId}/watch/providers`, {}, 60 * 60 * 1000) // 1 hour cache
    } catch (error) {
      throw new Error('Failed to fetch watch providers')
    }
  }

  // Advanced discover with filters
  async discoverMoviesAdvanced(filters = {}, page = 1) {
    try {
      const params = {
        page,
        sort_by: filters.sortBy || 'popularity.desc',
        ...filters
      }

      return await this.cachedApiCall('/discover/movie', params, 10 * 60 * 1000) // 10 min cache
    } catch (error) {
      throw new Error('Failed to discover movies with filters')
    }
  }

  async discoverTVAdvanced(filters = {}, page = 1) {
    try {
      const params = {
        page,
        sort_by: filters.sortBy || 'popularity.desc',
        ...filters
      }

      return await this.cachedApiCall('/discover/tv', params, 10 * 60 * 1000) // 10 min cache
    } catch (error) {
      throw new Error('Failed to discover TV shows with filters')
    }
  }

  // Get TV show seasons
  async getTVSeasons(tvId) {
    try {
      return await this.cachedApiCall(`/tv/${tvId}`, { append_to_response: 'seasons' }, 30 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch TV seasons')
    }
  }

  // Get specific season details
  async getSeasonDetails(tvId, seasonNumber) {
    try {
      return await this.cachedApiCall(`/tv/${tvId}/season/${seasonNumber}`, {}, 30 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch season details')
    }
  }

  // Get episode details
  async getEpisodeDetails(tvId, seasonNumber, episodeNumber) {
    try {
      return await this.cachedApiCall(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, {}, 30 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch episode details')
    }
  }

  // Get person details (cast/crew)
  async getPersonDetails(personId) {
    try {
      return await this.cachedApiCall(`/person/${personId}`, { append_to_response: 'movie_credits,tv_credits,images' }, 60 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch person details')
    }
  }

  // Get trending people
  async getTrendingPeople(timeWindow = 'week', page = 1) {
    try {
      return await this.cachedApiCall(`/trending/person/${timeWindow}`, { page }, 60 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch trending people')
    }
  }

  // Search for people
  async searchPeople(query, page = 1) {
    try {
      return await this.cachedApiCall('/search/person', { query, page }, 5 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to search people')
    }
  }

  // Get similar content
  async getSimilarMovies(movieId, page = 1) {
    try {
      return await this.cachedApiCall(`/movie/${movieId}/similar`, { page }, 30 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch similar movies')
    }
  }

  async getSimilarTVShows(tvId, page = 1) {
    try {
      return await this.cachedApiCall(`/tv/${tvId}/similar`, { page }, 30 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch similar TV shows')
    }
  }

  // Get content by network (for TV shows)
  async getContentByNetwork(networkId, page = 1) {
    try {
      return await this.cachedApiCall('/discover/tv', { with_networks: networkId, page }, 30 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch content by network')
    }
  }

  // Get available streaming providers by region
  async getWatchProviderRegions() {
    try {
      return await this.cachedApiCall('/watch/providers/regions', {}, 24 * 60 * 60 * 1000) // 24 hour cache
    } catch (error) {
      throw new Error('Failed to fetch watch provider regions')
    }
  }

  // Get all available streaming providers
  async getWatchProviders(type = 'movie') {
    try {
      return await this.cachedApiCall(`/watch/providers/${type}`, {}, 24 * 60 * 60 * 1000) // 24 hour cache
    } catch (error) {
      throw new Error('Failed to fetch watch providers')
    }
  }

  // Get content by streaming provider
  async getContentByProvider(providerId, type = 'movie', region = 'US', page = 1) {
    try {
      const endpoint = type === 'movie' ? '/discover/movie' : '/discover/tv'
      return await this.cachedApiCall(endpoint, {
        with_watch_providers: providerId,
        watch_region: region,
        page
      }, 30 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch content by provider')
    }
  }

  // Get movie/TV show keywords
  async getMovieKeywords(movieId) {
    try {
      return await this.cachedApiCall(`/movie/${movieId}/keywords`, {}, 60 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch movie keywords')
    }
  }

  async getTVKeywords(tvId) {
    try {
      return await this.cachedApiCall(`/tv/${tvId}/keywords`, {}, 60 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch TV keywords')
    }
  }

  // Get content by keyword
  async getContentByKeyword(keywordId, type = 'movie', page = 1) {
    try {
      const endpoint = type === 'movie' ? '/discover/movie' : '/discover/tv'
      return await this.cachedApiCall(endpoint, {
        with_keywords: keywordId,
        page
      }, 30 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch content by keyword')
    }
  }

  // Get external IDs for cross-platform linking
  async getMovieExternalIds(movieId) {
    try {
      return await this.cachedApiCall(`/movie/${movieId}/external_ids`, {}, 60 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch movie external IDs')
    }
  }

  async getTVExternalIds(tvId) {
    try {
      return await this.cachedApiCall(`/tv/${tvId}/external_ids`, {}, 60 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch TV external IDs')
    }
  }

  // Get content ratings
  async getMovieReleaseDates(movieId) {
    try {
      return await this.cachedApiCall(`/movie/${movieId}/release_dates`, {}, 60 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch movie release dates')
    }
  }

  async getTVContentRatings(tvId) {
    try {
      return await this.cachedApiCall(`/tv/${tvId}/content_ratings`, {}, 60 * 60 * 1000)
    } catch (error) {
      throw new Error('Failed to fetch TV content ratings')
    }
  }
}

export default new TMDBService()
