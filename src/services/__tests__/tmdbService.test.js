import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import tmdbService from '../tmdbService'

// Mock fetch globally
global.fetch = vi.fn()

describe('TMDBService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear any cached data
    tmdbService.cache?.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Search Operations', () => {
    it('should search for movies successfully', async () => {
      const mockResponse = {
        page: 1,
        results: [
          {
            id: 1,
            title: 'Test Movie',
            overview: 'A test movie',
            poster_path: '/test.jpg',
            release_date: '2023-01-01',
            vote_average: 8.5
          }
        ],
        total_pages: 1,
        total_results: 1
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await tmdbService.searchMovies('test movie')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/movie'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer')
          })
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle search errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(tmdbService.searchMovies('test')).rejects.toThrow('Failed to search movies')
    })

    it('should search multiple content types', async () => {
      const mockResponse = {
        page: 1,
        results: [
          { id: 1, title: 'Movie Result', media_type: 'movie' },
          { id: 2, name: 'TV Result', media_type: 'tv' },
          { id: 3, name: 'Person Result', media_type: 'person' }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await tmdbService.searchMulti('test query')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/multi'),
        expect.any(Object)
      )
      expect(result.results).toHaveLength(3)
      expect(result.results[0].media_type).toBe('movie')
      expect(result.results[1].media_type).toBe('tv')
      expect(result.results[2].media_type).toBe('person')
    })
  })

  describe('Content Discovery', () => {
    it('should fetch trending content', async () => {
      const mockTrendingData = {
        page: 1,
        results: [
          { id: 1, title: 'Trending Movie 1', media_type: 'movie' },
          { id: 2, name: 'Trending TV Show 1', media_type: 'tv' }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrendingData
      })

      const result = await tmdbService.getTrending('all', 'week')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/trending/all/week'),
        expect.any(Object)
      )
      expect(result).toEqual(mockTrendingData)
    })

    it('should fetch popular movies', async () => {
      const mockPopularMovies = {
        page: 1,
        results: [
          { id: 1, title: 'Popular Movie 1' },
          { id: 2, title: 'Popular Movie 2' }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPopularMovies
      })

      const result = await tmdbService.getPopularMovies()

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/movie/popular'),
        expect.any(Object)
      )
      expect(result.results).toHaveLength(2)
    })

    it('should fetch upcoming movies', async () => {
      const mockUpcomingMovies = {
        page: 1,
        results: [
          { id: 1, title: 'Upcoming Movie 1', release_date: '2024-01-01' }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpcomingMovies
      })

      const result = await tmdbService.getUpcomingMovies()

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/movie/upcoming'),
        expect.any(Object)
      )
      expect(result).toEqual(mockUpcomingMovies)
    })
  })

  describe('Detailed Information', () => {
    it('should fetch movie details with additional data', async () => {
      const mockMovieDetails = {
        id: 1,
        title: 'Test Movie',
        overview: 'Detailed overview',
        runtime: 120,
        genres: [{ id: 28, name: 'Action' }],
        credits: {
          cast: [{ id: 1, name: 'Actor 1', character: 'Character 1' }],
          crew: [{ id: 2, name: 'Director 1', job: 'Director' }]
        },
        videos: {
          results: [{ key: 'abc123', type: 'Trailer', site: 'YouTube' }]
        },
        similar: {
          results: [{ id: 2, title: 'Similar Movie' }]
        }
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMovieDetails
      })

      const result = await tmdbService.getMovieDetails(1)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/movie/1'),
        expect.any(Object)
      )
      expect(result.credits.cast).toHaveLength(1)
      expect(result.videos.results).toHaveLength(1)
      expect(result.similar.results).toHaveLength(1)
    })

    it('should fetch TV show details', async () => {
      const mockTVDetails = {
        id: 1,
        name: 'Test TV Show',
        overview: 'TV show overview',
        number_of_seasons: 3,
        number_of_episodes: 30,
        genres: [{ id: 18, name: 'Drama' }]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTVDetails
      })

      const result = await tmdbService.getTVDetails(1)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tv/1'),
        expect.any(Object)
      )
      expect(result.number_of_seasons).toBe(3)
      expect(result.number_of_episodes).toBe(30)
    })

    it('should fetch person details', async () => {
      const mockPersonDetails = {
        id: 1,
        name: 'Test Actor',
        biography: 'Actor biography',
        known_for_department: 'Acting',
        movie_credits: {
          cast: [{ id: 1, title: 'Movie 1', character: 'Character 1' }]
        },
        tv_credits: {
          cast: [{ id: 2, name: 'TV Show 1', character: 'Character 2' }]
        }
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPersonDetails
      })

      const result = await tmdbService.getPersonDetails(1)

      expect(result.movie_credits.cast).toHaveLength(1)
      expect(result.tv_credits.cast).toHaveLength(1)
    })
  })

  describe('Caching', () => {
    it('should cache API responses', async () => {
      const mockResponse = {
        page: 1,
        results: [{ id: 1, title: 'Cached Movie' }]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      // First call
      const result1 = await tmdbService.getPopularMovies()
      expect(fetch).toHaveBeenCalledTimes(1)

      // Second call should use cache
      const result2 = await tmdbService.getPopularMovies()
      expect(fetch).toHaveBeenCalledTimes(1) // Still only 1 call
      expect(result1).toEqual(result2)
    })

    it('should respect cache duration', async () => {
      const mockResponse = { results: [] }

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      })

      // Mock Date.now to control cache expiration
      const originalDateNow = Date.now
      let currentTime = 1000000

      Date.now = vi.fn(() => currentTime)

      // First call
      await tmdbService.getPopularMovies()
      expect(fetch).toHaveBeenCalledTimes(1)

      // Advance time but within cache duration
      currentTime += 10000 // 10 seconds
      await tmdbService.getPopularMovies()
      expect(fetch).toHaveBeenCalledTimes(1) // Still cached

      // Advance time beyond cache duration
      currentTime += 2000000 // Much later
      await tmdbService.getPopularMovies()
      expect(fetch).toHaveBeenCalledTimes(2) // Cache expired, new call

      Date.now = originalDateNow
    })
  })

  describe('Error Handling', () => {
    it('should handle HTTP errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(tmdbService.getMovieDetails(999)).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(tmdbService.searchMovies('test')).rejects.toThrow('Failed to search movies')
    })

    it('should handle malformed JSON responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        }
      })

      await expect(tmdbService.getPopularMovies()).rejects.toThrow()
    })
  })

  describe('Rate Limiting', () => {
    it('should handle rate limit errors with retry', async () => {
      // First call fails with rate limit
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      })

      // Second call succeeds
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      })

      const result = await tmdbService.getPopularMovies()

      expect(fetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual({ results: [] })
    })
  })

  describe('Watch Providers', () => {
    it('should fetch watch providers for movies', async () => {
      const mockProviders = {
        id: 1,
        results: {
          US: {
            link: 'https://www.themoviedb.org/movie/1/watch',
            flatrate: [
              { provider_id: 8, provider_name: 'Netflix' }
            ],
            rent: [
              { provider_id: 2, provider_name: 'Apple iTunes' }
            ]
          }
        }
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProviders
      })

      const result = await tmdbService.getMovieWatchProviders(1)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/movie/1/watch/providers'),
        expect.any(Object)
      )
      expect(result.results.US.flatrate).toHaveLength(1)
      expect(result.results.US.rent).toHaveLength(1)
    })
  })
})
